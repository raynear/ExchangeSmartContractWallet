// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './CloneFactory.sol';
import './Wallet.sol';
import './Manageable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol';

contract MasterWallet is Manageable, CloneFactory {
    using SafeMath for uint256;
    using Address for address;

    mapping(address => address payable) private _coldWallet;
    address private _wallet;
    uint private _hotRate;

    event ColdWalletChanged(address tokenAddress, address coldWalletAddress);
    event WalletCreated(address walletAddress);

    function initialize(address owner) public initializer {
        __Manageable_init();
        _wallet = address(new Wallet());
        _coldWallet[address(0)] = payable(owner);
        _hotRate = 30;
    }

    function changeHotColdRate(uint hotRate) public onlyOwner {
        require(hotRate < 100 && hotRate > 0);
        _hotRate = hotRate;
    }

    function createWallet() public onlyManager {
        bytes memory _payload = abi.encodeWithSignature("initialize(address)", address(this));
        address newWallet = createClone(_wallet, _payload);
        emit WalletCreated(newWallet);
    }

    function sendTokens(address[] memory tokenAddress, address[] memory target, uint256[] memory amount) public payable onlyManager {
        require(tokenAddress.length == target.length && target.length == amount.length);
        for(uint i=0 ; i<tokenAddress.length ; i++) {
            if(tokenAddress[i] == address(0)) {
                payable(target[i]).transfer(amount[i]);
            } else {
                IERC20(tokenAddress[i]).transfer(target[i], amount[i]);
            }
        }
    }

    function gathering(address[] memory tokenAddress, address[] memory target) public payable onlyManager {
        for(uint i=0 ; i<tokenAddress.length ; i++) {
            Wallet(payable(target[i])).transfer(tokenAddress[i]);
        }
    }

    function rebalancingMany(address[] memory tokens) public onlyManager {
        for(uint i=0 ; i<tokens.length ; i++) {
            rebalancing(tokens[i]);
        }
    }

    function rebalancing(address tokenAddress) public onlyManager {
        uint256 coldBalance;
        uint256 hotBalance;
        uint256 targetValue;

        if(tokenAddress == address(0)) {
            coldBalance = _coldWallet[address(0)].balance;
            hotBalance = address(this).balance;

            targetValue = percent(SafeMath.add(hotBalance,coldBalance), _hotRate);
            // safemath 적용해야함
            if(hotBalance > targetValue) {
                _coldWallet[address(0)].transfer(SafeMath.sub(hotBalance,targetValue));
            }
        } else {
            coldBalance = IERC20(tokenAddress).balanceOf(_coldWallet[tokenAddress]);
            hotBalance = IERC20(tokenAddress).balanceOf(address(this));

            targetValue = percent(SafeMath.add(hotBalance,coldBalance), _hotRate);
            // safemath 적용해야함
            if(hotBalance > targetValue) {
                IERC20(tokenAddress).transfer(_coldWallet[tokenAddress], SafeMath.sub(hotBalance, targetValue));
            }
        }
    }

    function setColdWallet(address tokenAddress, address payable coldWalletAddress) public onlyOwner {
        _coldWallet[tokenAddress] = coldWalletAddress;
        emit ColdWalletChanged(tokenAddress, coldWalletAddress);
    }

    function getColdWallet(address tokenAddress) public view returns(address payable) {
        return _coldWallet[tokenAddress];
    }

    function percent(uint256 _value, uint256 _percent) public view returns (uint256)  {
        uint256 percentage = SafeMath.mul(_percent, 100);
        uint256 roundValue = ceil(_value, percentage);
        uint256 retPercent = SafeMath.div(SafeMath.mul(roundValue, percentage), 10000);
        return retPercent;
    }

    function ceil(uint256 a, uint256 m) internal pure returns (uint256) {
        uint256 c = SafeMath.add(a,m);
        uint256 d = SafeMath.sub(c,1);
        return SafeMath.mul(SafeMath.div(d,m),m);
    }

    receive() external payable {
    }
}