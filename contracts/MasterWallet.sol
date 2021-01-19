// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import './Ownable.sol';
import './proxy/CloneFactory.sol';
import './Wallet.sol';
import './IERC20.sol';
import './Initializable.sol';

contract MasterWallet is Ownable, CloneFactory {
    mapping(address => address payable) private _coldWallet;
    address private _wallet;
    uint private _hotRate;

    event ColdWalletChanged(address tokenAddress, address coldWalletAddress);
    event WalletCreated(address walletAddress);

    function initialize(address owner) public initializer {
        _wallet = address(new Wallet());
        _coldWallet[address(0)] = payable(owner);
        _hotRate = 30;
    }

    function createWallet() public onlyOwner {
        bytes memory _payload = abi.encodeWithSignature("initialize(address)", address(this));
        address newWallet = createClone(_wallet, _payload);
        emit WalletCreated(newWallet);
    }

    function sendTokens(address[] memory tokenAddress, address[] memory target, uint256[] memory amount) public payable onlyManager {
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

    function setColdWallet(address tokenAddress, address payable coldWalletAddress) public onlyOwner {
        _coldWallet[tokenAddress] = coldWalletAddress;
        emit ColdWalletChanged(tokenAddress, coldWalletAddress);
    }

    function getColdWallet(address tokenAddress) public view returns(address payable) {
        return _coldWallet[tokenAddress];
    }

    function getWallet() public view returns(address) {
        return _wallet;
    }

    function rebalancing(address tokenAddress) public onlyManager {
        uint256 coldBalance = 0;
        uint256 hotBalance = 0;
        if(tokenAddress == address(0)) {
            coldBalance = _coldWallet[address(0)].balance;
            hotBalance = address(this).balance;

            // safemath 적용해야함
            if((hotBalance+coldBalance)*(_hotRate/(100-_hotRate)) < hotBalance) {
                _coldWallet[address(0)].transfer(hotBalance-(hotBalance+coldBalance)*(_hotRate/(100-_hotRate)));
            }
        } else {
            coldBalance = IERC20(tokenAddress).balanceOf(_coldWallet[tokenAddress]);
            hotBalance = IERC20(tokenAddress).balanceOf(address(this));

            // safemath 적용해야함
            if((hotBalance+coldBalance)*(_hotRate/(100-_hotRate)) < hotBalance) {
                IERC20(tokenAddress).transfer(_coldWallet[tokenAddress], hotBalance-(hotBalance+coldBalance)*(_hotRate/(100-_hotRate)));
            }
        }
    }

    receive() external payable {}
}