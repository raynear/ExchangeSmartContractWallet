// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import './Ownable.sol';
import './proxy/CloneFactory.sol';
//import './MasterProxy.sol';
import './Wallet.sol';
import './IERC20.sol';

contract WalletFactory is Ownable, CloneFactory {
    mapping(address => address payable) private _coldWallet;
//    address private _walletProxy;
    address private _wallet;

    event ColdWalletChanged(address tokenAddress, address coldWalletAddress);
    event WalletChanged(address newWalletAddress);
    event WalletCreated(address walletAddress);

    struct transfer {
        address tokenAddress;
        address payable target;
        uint256 amount;
    }

    struct gather {
        address tokenAddress;
        address payable target;
    }

    constructor() public {
//        _walletProxy = address(new MasterProxy());
        _wallet = address(new Wallet());
        _coldWallet[address(0)] = msg.sender;
    }

    function createWallet() public onlyOwner {
        address newWallet = createClone(_wallet);
        Wallet(payable(newWallet)).init(address(this));
        emit WalletCreated(newWallet);
    }

    function replaceWalletContract(address newWalletContract) public onlyOwner {
        _wallet = newWalletContract;
        emit WalletChanged(newWalletContract);
    }

    function sendTokens(transfer[] memory WithdrawList) public payable onlyManager {
        for(uint i=0 ; i<WithdrawList.length ; i++) {
            if(WithdrawList[i].tokenAddress == address(0)) {
                WithdrawList[i].target.transfer(WithdrawList[i].amount);
            } else {
                IERC20(WithdrawList[i].tokenAddress).transfer(WithdrawList[i].target, WithdrawList[i].amount);
            }
        }
    }

    function gathering(gather[] memory GatheringList) public payable onlyManager {
        for(uint i=0 ; i<GatheringList.length ; i++) {
            Wallet(GatheringList[i].target).transfer(GatheringList[i].tokenAddress);
        }
    }

    function setColdWallet(address tokenAddress, address payable coldWalletAddress) public onlyOwner {
        _coldWallet[tokenAddress] = coldWalletAddress;
        emit ColdWalletChanged(tokenAddress, coldWalletAddress);
    }

    function getColdWallet(address tokenAddress) public view returns(address payable) {
        return _coldWallet[tokenAddress];
    }

    function getWallet() public view returns(address payable) {
        return payable(_wallet);
    }

    receive() external payable {}
}