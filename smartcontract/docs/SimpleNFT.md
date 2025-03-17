# Solidity API

## SimpleNFT

_A basic NFT contract implementing ERC-721 with metadata, access control, mint limits, and pausable functionality_

### Contract
SimpleNFT : contracts/SimpleNFT.sol

A basic NFT contract implementing ERC-721 with metadata, access control, mint limits, and pausable functionality

 --- 
### Functions:
### constructor

```solidity
constructor(string _name, string _symbol, string _baseURI, uint256 _mintLimit, uint256 _supplyLimit) public
```

_Constructor initializes the NFT collection_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | Name of the NFT collection |
| _symbol | string | Symbol of the NFT collection |
| _baseURI | string | Base URI for NFT metadata |
| _mintLimit | uint256 | Maximum number of NFTs per address |
| _supplyLimit | uint256 | Maximum total supply of NFTs |

### mint

```solidity
function mint(address _recipient, string _tokenURI) public returns (uint256)
```

_Mints a new NFT token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _recipient | address | Address to receive the NFT |
| _tokenURI | string | URI for the token metadata |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | tokenId The ID of the minted token |

### adminMint

```solidity
function adminMint(address _recipient, string _tokenURI) public returns (uint256)
```

_Allows owner to mint a token for another address (for admin purposes)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _recipient | address | Address to receive the NFT |
| _tokenURI | string | URI for the token metadata |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | tokenId The ID of the minted token |

### pause

```solidity
function pause() public
```

_Pauses minting functionality_

### unpause

```solidity
function unpause() public
```

_Unpauses minting functionality_

### setMaxMintsPerAddress

```solidity
function setMaxMintsPerAddress(uint256 _newMaxMints) public
```

_Sets the maximum number of NFTs that can be minted per address_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newMaxMints | uint256 | New maximum mint limit per address |

### setMaxSupply

```solidity
function setMaxSupply(uint256 _newMaxSupply) public
```

_Sets the maximum total supply of NFTs_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newMaxSupply | uint256 | New maximum total supply |

### setBaseURI

```solidity
function setBaseURI(string _newBaseURI) public
```

_Sets the base URI for all token metadata_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newBaseURI | string | New base URI |

### tokenURI

```solidity
function tokenURI(uint256 _tokenId) public view returns (string)
```

_Returns the token URI_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | Token ID |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | URI for the token metadata |

### baseURI

```solidity
function baseURI() public view returns (string)
```

_Returns the base token URI_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | Base URI string |

### totalSupply

```solidity
function totalSupply() public view returns (uint256)
```

_Returns the total number of tokens minted_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Total supply |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_See {IERC165-supportsInterface}.
Overridden to resolve inheritance conflict._

### _update

```solidity
function _update(address to, uint256 tokenId, address auth) internal returns (address)
```

_Internal function to update owner state during transfers.
Overridden to resolve inheritance conflict._

inherits AccessControl:
### hasRole

```solidity
function hasRole(bytes32 role, address account) public view virtual returns (bool)
```

_Returns `true` if `account` has been granted `role`._

### _checkRole

```solidity
function _checkRole(bytes32 role) internal view virtual
```

_Reverts with an {AccessControlUnauthorizedAccount} error if `_msgSender()`
is missing `role`. Overriding this function changes the behavior of the {onlyRole} modifier._

### _checkRole

```solidity
function _checkRole(bytes32 role, address account) internal view virtual
```

_Reverts with an {AccessControlUnauthorizedAccount} error if `account`
is missing `role`._

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) public view virtual returns (bytes32)
```

_Returns the admin role that controls `role`. See {grantRole} and
{revokeRole}.

To change a role's admin, use {_setRoleAdmin}._

### grantRole

```solidity
function grantRole(bytes32 role, address account) public virtual
```

_Grants `role` to `account`.

If `account` had not been already granted `role`, emits a {RoleGranted}
event.

Requirements:

- the caller must have ``role``'s admin role.

May emit a {RoleGranted} event._

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) public virtual
```

_Revokes `role` from `account`.

If `account` had been granted `role`, emits a {RoleRevoked} event.

Requirements:

- the caller must have ``role``'s admin role.

May emit a {RoleRevoked} event._

### renounceRole

```solidity
function renounceRole(bytes32 role, address callerConfirmation) public virtual
```

_Revokes `role` from the calling account.

Roles are often managed via {grantRole} and {revokeRole}: this function's
purpose is to provide a mechanism for accounts to lose their privileges
if they are compromised (such as when a trusted device is misplaced).

If the calling account had been revoked `role`, emits a {RoleRevoked}
event.

Requirements:

- the caller must be `callerConfirmation`.

May emit a {RoleRevoked} event._

### _setRoleAdmin

```solidity
function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual
```

_Sets `adminRole` as ``role``'s admin role.

Emits a {RoleAdminChanged} event._

### _grantRole

```solidity
function _grantRole(bytes32 role, address account) internal virtual returns (bool)
```

_Attempts to grant `role` to `account` and returns a boolean indicating if `role` was granted.

Internal function without access restriction.

May emit a {RoleGranted} event._

### _revokeRole

```solidity
function _revokeRole(bytes32 role, address account) internal virtual returns (bool)
```

_Attempts to revoke `role` to `account` and returns a boolean indicating if `role` was revoked.

Internal function without access restriction.

May emit a {RoleRevoked} event._

inherits ERC721Pausable:
inherits Pausable:
### paused

```solidity
function paused() public view virtual returns (bool)
```

_Returns true if the contract is paused, and false otherwise._

### _requireNotPaused

```solidity
function _requireNotPaused() internal view virtual
```

_Throws if the contract is paused._

### _requirePaused

```solidity
function _requirePaused() internal view virtual
```

_Throws if the contract is not paused._

### _pause

```solidity
function _pause() internal virtual
```

_Triggers stopped state.

Requirements:

- The contract must not be paused._

### _unpause

```solidity
function _unpause() internal virtual
```

_Returns to normal state.

Requirements:

- The contract must be paused._

inherits ERC721URIStorage:
### _setTokenURI

```solidity
function _setTokenURI(uint256 tokenId, string _tokenURI) internal virtual
```

_Sets `_tokenURI` as the tokenURI of `tokenId`.

Emits {MetadataUpdate}._

inherits ERC721:
### balanceOf

```solidity
function balanceOf(address owner) public view virtual returns (uint256)
```

_See {IERC721-balanceOf}._

### ownerOf

```solidity
function ownerOf(uint256 tokenId) public view virtual returns (address)
```

_See {IERC721-ownerOf}._

### name

```solidity
function name() public view virtual returns (string)
```

_See {IERC721Metadata-name}._

### symbol

```solidity
function symbol() public view virtual returns (string)
```

_See {IERC721Metadata-symbol}._

### _baseURI

```solidity
function _baseURI() internal view virtual returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### approve

```solidity
function approve(address to, uint256 tokenId) public virtual
```

_See {IERC721-approve}._

### getApproved

```solidity
function getApproved(uint256 tokenId) public view virtual returns (address)
```

_See {IERC721-getApproved}._

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) public virtual
```

_See {IERC721-setApprovalForAll}._

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) public view virtual returns (bool)
```

_See {IERC721-isApprovedForAll}._

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) public virtual
```

_See {IERC721-transferFrom}._

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) public
```

_See {IERC721-safeTransferFrom}._

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) public virtual
```

_See {IERC721-safeTransferFrom}._

### _ownerOf

```solidity
function _ownerOf(uint256 tokenId) internal view virtual returns (address)
```

_Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist

IMPORTANT: Any overrides to this function that add ownership of tokens not tracked by the
core ERC-721 logic MUST be matched with the use of {_increaseBalance} to keep balances
consistent with ownership. The invariant to preserve is that for any address `a` the value returned by
`balanceOf(a)` must be equal to the number of tokens such that `_ownerOf(tokenId)` is `a`._

### _getApproved

```solidity
function _getApproved(uint256 tokenId) internal view virtual returns (address)
```

_Returns the approved address for `tokenId`. Returns 0 if `tokenId` is not minted._

### _isAuthorized

```solidity
function _isAuthorized(address owner, address spender, uint256 tokenId) internal view virtual returns (bool)
```

_Returns whether `spender` is allowed to manage `owner`'s tokens, or `tokenId` in
particular (ignoring whether it is owned by `owner`).

WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
assumption._

### _checkAuthorized

```solidity
function _checkAuthorized(address owner, address spender, uint256 tokenId) internal view virtual
```

_Checks if `spender` can operate on `tokenId`, assuming the provided `owner` is the actual owner.
Reverts if:
- `spender` does not have approval from `owner` for `tokenId`.
- `spender` does not have approval to manage all of `owner`'s assets.

WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
assumption._

### _increaseBalance

```solidity
function _increaseBalance(address account, uint128 value) internal virtual
```

_Unsafe write access to the balances, used by extensions that "mint" tokens using an {ownerOf} override.

NOTE: the value is limited to type(uint128).max. This protect against _balance overflow. It is unrealistic that
a uint256 would ever overflow from increments when these increments are bounded to uint128 values.

WARNING: Increasing an account's balance using this function tends to be paired with an override of the
{_ownerOf} function to resolve the ownership of the corresponding tokens so that balances and ownership
remain consistent with one another._

### _mint

```solidity
function _mint(address to, uint256 tokenId) internal
```

_Mints `tokenId` and transfers it to `to`.

WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible

Requirements:

- `tokenId` must not exist.
- `to` cannot be the zero address.

Emits a {Transfer} event._

### _safeMint

```solidity
function _safeMint(address to, uint256 tokenId) internal
```

_Mints `tokenId`, transfers it to `to` and checks for `to` acceptance.

Requirements:

- `tokenId` must not exist.
- If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.

Emits a {Transfer} event._

### _safeMint

```solidity
function _safeMint(address to, uint256 tokenId, bytes data) internal virtual
```

_Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
forwarded in {IERC721Receiver-onERC721Received} to contract recipients._

### _burn

```solidity
function _burn(uint256 tokenId) internal
```

_Destroys `tokenId`.
The approval is cleared when the token is burned.
This is an internal function that does not check if the sender is authorized to operate on the token.

Requirements:

- `tokenId` must exist.

Emits a {Transfer} event._

### _transfer

```solidity
function _transfer(address from, address to, uint256 tokenId) internal
```

_Transfers `tokenId` from `from` to `to`.
 As opposed to {transferFrom}, this imposes no restrictions on msg.sender.

Requirements:

- `to` cannot be the zero address.
- `tokenId` token must be owned by `from`.

Emits a {Transfer} event._

### _safeTransfer

```solidity
function _safeTransfer(address from, address to, uint256 tokenId) internal
```

_Safely transfers `tokenId` token from `from` to `to`, checking that contract recipients
are aware of the ERC-721 standard to prevent tokens from being forever locked.

`data` is additional data, it has no specified format and it is sent in call to `to`.

This internal function is like {safeTransferFrom} in the sense that it invokes
{IERC721Receiver-onERC721Received} on the receiver, and can be used to e.g.
implement alternative mechanisms to perform token transfer, such as signature-based.

Requirements:

- `tokenId` token must exist and be owned by `from`.
- `to` cannot be the zero address.
- `from` cannot be the zero address.
- If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.

Emits a {Transfer} event._

### _safeTransfer

```solidity
function _safeTransfer(address from, address to, uint256 tokenId, bytes data) internal virtual
```

_Same as {xref-ERC721-_safeTransfer-address-address-uint256-}[`_safeTransfer`], with an additional `data` parameter which is
forwarded in {IERC721Receiver-onERC721Received} to contract recipients._

### _approve

```solidity
function _approve(address to, uint256 tokenId, address auth) internal
```

_Approve `to` to operate on `tokenId`

The `auth` argument is optional. If the value passed is non 0, then this function will check that `auth` is
either the owner of the token, or approved to operate on all tokens held by this owner.

Emits an {Approval} event.

Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument._

### _approve

```solidity
function _approve(address to, uint256 tokenId, address auth, bool emitEvent) internal virtual
```

_Variant of `_approve` with an optional flag to enable or disable the {Approval} event. The event is not
emitted in the context of transfers._

### _setApprovalForAll

```solidity
function _setApprovalForAll(address owner, address operator, bool approved) internal virtual
```

_Approve `operator` to operate on all of `owner` tokens

Requirements:
- operator can't be the address zero.

Emits an {ApprovalForAll} event._

### _requireOwned

```solidity
function _requireOwned(uint256 tokenId) internal view returns (address)
```

_Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
Returns the owner.

Overrides to ownership logic should be done to {_ownerOf}._

inherits IERC721Errors:
inherits IERC721Metadata:
inherits IERC4906:
inherits IERC721:
inherits ERC165:
inherits IERC165:
inherits IAccessControl:

 --- 
### Events:
### MintedNFT

```solidity
event MintedNFT(address minter, uint256 tokenId, string tokenURI)
```

### MaxMintsPerAddressUpdated

```solidity
event MaxMintsPerAddressUpdated(uint256 oldValue, uint256 newValue)
```

### MaxSupplyUpdated

```solidity
event MaxSupplyUpdated(uint256 oldValue, uint256 newValue)
```

### BaseURIUpdated

```solidity
event BaseURIUpdated(string oldBaseURI, string newBaseURI)
```

inherits AccessControl:
inherits ERC721Pausable:
inherits Pausable:
### Paused

```solidity
event Paused(address account)
```

_Emitted when the pause is triggered by `account`._

### Unpaused

```solidity
event Unpaused(address account)
```

_Emitted when the pause is lifted by `account`._

inherits ERC721URIStorage:
inherits ERC721:
inherits IERC721Errors:
inherits IERC721Metadata:
inherits IERC4906:
### MetadataUpdate

```solidity
event MetadataUpdate(uint256 _tokenId)
```

_This event emits when the metadata of a token is changed.
So that the third-party platforms such as NFT market could
timely update the images and related attributes of the NFT._

### BatchMetadataUpdate

```solidity
event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId)
```

_This event emits when the metadata of a range of tokens is changed.
So that the third-party platforms such as NFT market could
timely update the images and related attributes of the NFTs._

inherits IERC721:
### Transfer

```solidity
event Transfer(address from, address to, uint256 tokenId)
```

_Emitted when `tokenId` token is transferred from `from` to `to`._

### Approval

```solidity
event Approval(address owner, address approved, uint256 tokenId)
```

_Emitted when `owner` enables `approved` to manage the `tokenId` token._

### ApprovalForAll

```solidity
event ApprovalForAll(address owner, address operator, bool approved)
```

_Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets._

inherits ERC165:
inherits IERC165:
inherits IAccessControl:
### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 role, bytes32 previousAdminRole, bytes32 newAdminRole)
```

_Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`

`DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
{RoleAdminChanged} not being emitted signaling this._

### RoleGranted

```solidity
event RoleGranted(bytes32 role, address account, address sender)
```

_Emitted when `account` is granted `role`.

`sender` is the account that originated the contract call. This account bears the admin role (for the granted role).
Expected in cases where the role was granted using the internal {AccessControl-_grantRole}._

### RoleRevoked

```solidity
event RoleRevoked(bytes32 role, address account, address sender)
```

_Emitted when `account` is revoked `role`.

`sender` is the account that originated the contract call:
  - if using `revokeRole`, it is the admin role bearer
  - if using `renounceRole`, it is the role bearer (i.e. `account`)_

