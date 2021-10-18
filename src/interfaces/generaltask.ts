import { EventResult, EventState } from '../components/generalTask/__generated__/GeneralTaskChildrenTabQuery.graphql';

export interface GeneralTaskParams {
  id: string;
  tabName: string;
  clipBoard: string;
}

export type GeneralTaskKeyValueListPairs = readonly ({
  readonly k: string | null;
  readonly v: readonly (string | null)[] | null;
} | null)[];

export interface ValidatedChildren {
  data?:
    | (
        | {
            readonly __typename: 'RuptureGenerationTask';
            readonly id: string;
            readonly created: unknown | null;
            readonly duration: number | null;
            readonly state: EventState | null;
            readonly result: EventResult | null;
            readonly arguments: ReadonlyArray<{
              readonly k: string | null;
              readonly v: string | null;
            } | null> | null;
          }
        | {
            readonly __typename: 'AutomationTask';
            readonly id: string;
            readonly created: unknown | null;
            readonly duration: number | null;
            readonly state: EventState | null;
            readonly result: EventResult | null;
            readonly arguments: ReadonlyArray<{
              readonly k: string | null;
              readonly v: string | null;
            } | null> | null;
          }
      )[];
}

export type SweepArgument = {
  readonly k: string | null;
  readonly v: readonly (string | null)[] | null;
} | null;

export type SweepArguments = readonly (SweepArgument | null)[];

export interface FilteredArgument {
  k: string;
  v: string[];
}

export interface FilteredArguments {
  data: {
    k: string;
    v: string[];
  }[];
}

export enum ViewTypeEnum {
  Report,
  Image,
}

export interface SolutionDiagnosticsOption {
  viewType: ViewTypeEnum;
  displayName: string;
  finalPath: string; // either a hash location, or a filepath/name# must be unique
  imgWdth: number | undefined;
  imgHght: number | undefined;
}

export type ValidatedSubtask = {
  __typename: 'AutomationTask';
  id: string;
  inversion_solution: {
    id: string;
    meta: Array<{
      readonly k: string | null;
      readonly v: string | null;
    } | null>;
  };
};
