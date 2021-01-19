// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./utils/Context.sol";
import "./Initializable.sol";

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context, Initializable {
    address private _owner;
    address private _newOwner;
    mapping (address => bool) public _manager;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ManagerChanged(address managerAddress, bool managerFlag);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    function initialize() internal initializer {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Throws if called by any account other than the manager.
     */
    modifier onlyManager() {
        require(_manager[_msgSender()] == true, "Ownable: caller is not the manager");
        _;
    }

    /**
     * @dev Throws if called by any account other than the manager.
     */
    function isManager(address manager) public view returns(bool) {
        return (_manager[manager] == true);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _newOwner = newOwner;
    }

    /**
     * @dev  acceptOwnership
     */
    function acceptOwnership() public virtual {
        require(_newOwner != _msgSender(), "Ownable: only newOwner can accept");
        emit OwnershipTransferred(_owner, _msgSender());
        _owner = _newOwner;
        _newOwner = address(0);
    }

    /**
     * @dev  setManager
     */
    function setManager(address newManagerAddress) public virtual onlyOwner {
        require(_manager[newManagerAddress] != true);
        _manager[newManagerAddress] = true;
        emit ManagerChanged(newManagerAddress, true);
    }

    /**
     * @dev  delManager
     */
    function delManager(address managerAddress) public virtual onlyOwner {
        require(_manager[managerAddress] == true);
        _manager[managerAddress] = false;
        emit ManagerChanged(managerAddress, false);
    }

}