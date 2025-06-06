/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface DidVerifierInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "isIssuerTrusted"
      | "setIssuerTrustStatus"
      | "verifyCredential"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "IssuerTrustStatusUpdated"): EventFragment;

  encodeFunctionData(
    functionFragment: "isIssuerTrusted",
    values: [string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setIssuerTrustStatus",
    values: [string, AddressLike, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyCredential",
    values: [string, AddressLike, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "isIssuerTrusted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setIssuerTrustStatus",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyCredential",
    data: BytesLike
  ): Result;
}

export namespace IssuerTrustStatusUpdatedEvent {
  export type InputTuple = [
    credentialType: string,
    issuer: AddressLike,
    trusted: boolean
  ];
  export type OutputTuple = [
    credentialType: string,
    issuer: string,
    trusted: boolean
  ];
  export interface OutputObject {
    credentialType: string;
    issuer: string;
    trusted: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface DidVerifier extends BaseContract {
  contractName: "DidVerifier";

  connect(runner?: ContractRunner | null): DidVerifier;
  waitForDeployment(): Promise<this>;

  interface: DidVerifierInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  isIssuerTrusted: TypedContractMethod<
    [credentialType: string, issuer: AddressLike],
    [boolean],
    "view"
  >;

  setIssuerTrustStatus: TypedContractMethod<
    [credentialType: string, issuer: AddressLike, trusted: boolean],
    [void],
    "nonpayable"
  >;

  verifyCredential: TypedContractMethod<
    [credentialType: string, issuer: AddressLike, subject: string],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "isIssuerTrusted"
  ): TypedContractMethod<
    [credentialType: string, issuer: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "setIssuerTrustStatus"
  ): TypedContractMethod<
    [credentialType: string, issuer: AddressLike, trusted: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "verifyCredential"
  ): TypedContractMethod<
    [credentialType: string, issuer: AddressLike, subject: string],
    [boolean],
    "view"
  >;

  getEvent(
    key: "IssuerTrustStatusUpdated"
  ): TypedContractEvent<
    IssuerTrustStatusUpdatedEvent.InputTuple,
    IssuerTrustStatusUpdatedEvent.OutputTuple,
    IssuerTrustStatusUpdatedEvent.OutputObject
  >;

  filters: {
    "IssuerTrustStatusUpdated(string,address,bool)": TypedContractEvent<
      IssuerTrustStatusUpdatedEvent.InputTuple,
      IssuerTrustStatusUpdatedEvent.OutputTuple,
      IssuerTrustStatusUpdatedEvent.OutputObject
    >;
    IssuerTrustStatusUpdated: TypedContractEvent<
      IssuerTrustStatusUpdatedEvent.InputTuple,
      IssuerTrustStatusUpdatedEvent.OutputTuple,
      IssuerTrustStatusUpdatedEvent.OutputObject
    >;
  };
}
