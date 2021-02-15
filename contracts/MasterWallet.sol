// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import './Wallet.sol';
import './Manageable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol';
//import '@optionality.io/clone-factory/contracts/CloneFactory.sol';
import './CloneFactory.sol';

contract MasterWallet is Manageable, CloneFactory {
    using SafeMath for uint256;
    using Address for address;

    address private _coldWallet;
    address private _wallet;
    uint private _hotRate;

    event ColdWalletChanged(address coldWalletAddress);
    event WalletCreated(address[] walletAddress);

    function initialize(address owner) public initializer {
        __Manageable_init();
        _coldWallet = owner;
        _hotRate = 30;
    }

    function setWalletModel(address wallet) public onlyOwner {
        _wallet = wallet;
    }

    function changeHotColdRate(uint hotRate) public onlyOwner {
        require(hotRate < 100 && hotRate > 0);
        _hotRate = hotRate;
    }

    function createWallet(uint n) public onlyManager {
        address[] memory walletList = new address[](n);
        // bytes memory _payload = abi.encodeWithSignature("initialize(address)", address(this));
        for(uint i=0 ; i<n; i++) {
            address newWallet = createClone(_wallet/*, _payload*/);
            Wallet(payable(newWallet)).initialize(address(this));
            walletList[i] = newWallet;
        }

        emit WalletCreated(walletList);
    }

    function sendTokens(address[] memory tokenAddress, address[] memory target, uint256[] memory amount) public payable onlyManager {
        require(tokenAddress.length == target.length && target.length == amount.length);
        for(uint i=0 ; i<tokenAddress.length ; i++) {
            if(tokenAddress[i] == address(0)) {
                payable(target[i]).transfer(amount[i]);
            } else {
                SafeERC20.safeTransfer(IERC20(tokenAddress[i]), target[i], amount[i]);
            }
        }
    }

    function gathering(address[] memory tokenAddress, address[] memory target) public onlyManager {
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
            coldBalance = _coldWallet.balance;
            hotBalance = address(this).balance;

            targetValue = percent(SafeMath.add(hotBalance,coldBalance), _hotRate);
            if(hotBalance > targetValue) {
                payable(_coldWallet).transfer(SafeMath.sub(hotBalance,targetValue));
            }
        } else {
            coldBalance = IERC20(tokenAddress).balanceOf(_coldWallet);
            hotBalance = IERC20(tokenAddress).balanceOf(address(this));

            targetValue = percent(SafeMath.add(hotBalance,coldBalance), _hotRate);
            if(hotBalance > targetValue) {
                SafeERC20.safeTransfer(IERC20(tokenAddress), _coldWallet, SafeMath.sub(hotBalance, targetValue));
            }
        }
    }

    function setColdWallet(address coldWalletAddress) public onlyOwner {
        _coldWallet = coldWalletAddress;
        emit ColdWalletChanged(coldWalletAddress);
    }

    function getColdWallet() public view returns(address) {
        return _coldWallet;
    }

    function percent(uint256 _value, uint256 _percent) internal pure returns (uint256)  {
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

    receive() external payable {}
}