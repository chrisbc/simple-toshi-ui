import React from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'babel-plugin-relay/macro';

import { InversionSolutionDiagnosticContainerQuery } from './__generated__/InversionSolutionDiagnosticContainerQuery.graphql';
import { SweepArguments } from '../../interfaces/generaltask';
import { validateSubtask } from '../../service/generalTask.service';
import DiagnosticReportCard from '../diagnosticReportView/DiagnosticReportCard';

interface InversionSolutionDiagnosticContainerProps {
  readonly sweepArgs?: SweepArguments;
  ids?: string[];
  generalViews: string[];
  setGeneralViews: (newViewOptions: string[]) => void;
  namedFaultsView: string;
  setNamedFaultsView: (view: string) => void;
  namedFaultsLocations: string[];
  setNamedFaultsLocations: (locations: string[]) => void;
}

const InversionSolutionDiagnosticContainer: React.FC<InversionSolutionDiagnosticContainerProps> = ({
  sweepArgs,
  ids,
  generalViews,
  setGeneralViews,
  namedFaultsView,
  setNamedFaultsView,
  namedFaultsLocations,
  setNamedFaultsLocations,
}: InversionSolutionDiagnosticContainerProps) => {
  const data = useLazyLoadQuery<InversionSolutionDiagnosticContainerQuery>(inversionSolutionDiagnosticContainerQuery, {
    id: ids,
  });
  const validatedSubtasks = validateSubtask(data, sweepArgs ?? []);

  return (
    <>
      <DiagnosticReportCard
        generalViews={generalViews}
        setGeneralViews={setGeneralViews}
        namedFaultsView={namedFaultsView}
        setNamedFaultsView={setNamedFaultsView}
        namedFaultsLocations={namedFaultsLocations}
        setNamedFaultsLocations={setNamedFaultsLocations}
        automationTasks={validatedSubtasks}
      />
    </>
  );
};

export default InversionSolutionDiagnosticContainer;

export const inversionSolutionDiagnosticContainerQuery = graphql`
  query InversionSolutionDiagnosticContainerQuery($id: [ID!]) {
    nodes(id_in: $id) {
      result {
        edges {
          node {
            __typename
            ... on AutomationTask {
              created
              task_type
              id
              inversion_solution {
                id
                file_name
                meta {
                  k
                  v
                }
              }
            }
          }
        }
      }
    }
  }
`;
