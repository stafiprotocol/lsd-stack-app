import { toNano } from '@ton/core';

export const err = {
  insufficientFee: 101,
  insufficientFunds: 102,
  accessDenied: 103,
  onlyBasechainAllowed: 104,
  receiverIsSender: 105,
  stopped: 106,
  invalidOp: 107,
  invalidComment: 108,
  invalidParameters: 109,

  notAcceptingLoanRequests: 201,
  unableToParticipate: 202,
  tooSoonToParticipate: 203,
  notReadyToFinishParticipation: 204,
  tooSoonToFinishParticipation: 205,
  vsetNotChanged: 206,
  vsetNotChangeable: 207,
};

export const op = {
  // elector
  newStake: 0x4e73744b,
  newStakeError: 0xee6f454c,
  newStakeOk: 0xf374484c,
  recoverStake: 0x47657424,
  recoverStakeError: 0xfffffffe,
  recoverStakeOk: 0xf96f7324,

  // stake pod
  proxyNewStake: 0x089cd4d0,

  // lsd token wallet
  sendTokens: 0x0f8a7ea5,
  receiveTokens: 0x178d4519,
  transferNotification: 0x7362d09c,
  withdrawalNotification: 0xf0fa223b,
  unstake: 0x595f07bc,
  withdraw: 0x5ae30142,
  revertWithdraw: 0x5ae30147,

  // lsd token master
  provideWalletAddress: 0x2c76b973,
  takeWalletAddress: 0xd1735400,

  setContent: 0x04dc78b7,
  proxyMintTokens: 0x5be57626, //
  proxyRequestUnstake: 0x688b0213, //
  proxyRequestWithdraw: 0x688b0212, //
  proxyRevertWithdraw: 0x688b0217, //

  // stake pool
  stake: 0x3d3761a6, //
  requestUnstake: 0x386a3581, //
  requestWithdraw: 0x386a358b, //
  unstakeResult: 0x5ae30141, //
  withdrawResult: 0x5ae30143, //
  proxyUnstakeResult: 0x688b0211, //
  proxyWithdrawResult: 0x688b0214, //
  mintTokens: 0x42684479, //
  requestLoan: 0x386a358c, //
  cancelLoan: 0x386a358d, //
  allocateLoan: 0x574a297b, //
  processLoan: 0x574a297c, //
  updateRound: 0x574a297e, //
  finishLoan: 0x574a297d, //
  setLsdTokenMaster: 0x4f6f6eed, //
  withdrawSurplus: 0x23355ffb,
  setPlatformCommissionRate: 0x3d3761a1,
  setMinStakeAmount: 0x3d3761a2,
  requestLoanCanceled: 0xcd0f2117,

  // stack
  newStakePool: 0x04dc78b9,

  // librarian
  addLibrary: 0x53d0473e,
  removeLibrary: 0x6bd0ce52,

  // common
  topUp: 0x5372158c,
  gasExcess: 0xd53276db,
  loanResult: 0xfaaa8366,
  init: 0x5372158f,
};

export const config = {
  election: BigInt(15),
  validators: BigInt(16),
  currentValidators: BigInt(34),
  nextValidators: BigInt(36),
};

export function tonValue(value: bigint | string): bigint {
  if (typeof value === 'string') {
    value = toNano(value);
  }
  return value;
}
