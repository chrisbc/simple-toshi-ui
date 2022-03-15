import React, { useContext, useEffect, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Button, ButtonGroup, Tooltip, Typography } from '@mui/material';
import { graphql } from 'babel-plugin-relay/macro';

import GeneralTaskDetailDrawer from '../components/diagnosticReportView/GeneralTaskDetailDrawer';
import DiagnosticReportCard from '../components/diagnosticReportView/DiagnosticReportCard';
import MySolutionsList from '../components/mySolutions/MySolutionsList';
import ControlsBar from '../components/common/ControlsBar';
import LocalStorageContext from '../contexts/localStorage';
import { GeneralTaskDetails } from '../interfaces/diagnosticReport';
import { MySolutionsQuery } from './__generated__/MySolutionsQuery.graphql';
import {
  getGeneralTaskDetails,
  getMySolutionIdsArray,
  getReportItems,
  validateListItems,
} from '../service/mySolution.service';
import CommonModal from '../components/common/Modal/CommonModal';
import { useShortcut } from '../hooks/useShortcut';

const MySolutions: React.FC = () => {
  const {
    ISFavourites,
    setISFavourites,
    localStorageGeneralViews,
    setLocalStorageGeneralViews,
    localStorageNamedFaultsView,
    setLocalStorageNamedFaultsView,
    localStorageNamedFaultsLocations,
    setLocalStorageNamedFaultsLocations,
    localStorageRegionalViews,
    setLocalStorageRegionalViews,
    localStorageNonRegionalViews,
    setLocalStorageNonRegionalViews,
    localStorageParentFault,
    setLocalStorageParentFault,
    localStorageParentFaultViews,
    setLocalStorageParentFaultViews,
  } = useContext(LocalStorageContext);

  const [showList, setShowList] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openLoadModal, setOpenLoadModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [disableHotkey, setDisableHotkey] = useState<boolean>(false);

  const id = getMySolutionIdsArray(ISFavourites);
  const data = useLazyLoadQuery<MySolutionsQuery>(mySolutionsQuery, { id });
  const listItems = validateListItems(data);
  const reportItems = getReportItems(listItems);

  const [currentGeneralTask, setCurrentGeneralTask] = useState<GeneralTaskDetails>(
    getGeneralTaskDetails(listItems, reportItems, 0),
  );

  const handleChangeCurrentImage = (index: number) => {
    setCurrentImage(index);
  };

  useEffect(() => {
    setCurrentGeneralTask(getGeneralTaskDetails(listItems, reportItems, currentImage));
  }, [listItems, reportItems, currentImage]);

  useShortcut(() => setShowList((v) => !v), ['s'], disableHotkey);
  useShortcut(() => setOpenDrawer((v) => !v), ['d'], disableHotkey);

  const handleImport = (value: string) => {
    const ISFavObj = JSON.parse(value);
    setISFavourites(ISFavObj);
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        My Solutions
      </Typography>
      <ControlsBar>
        <ButtonGroup variant="contained">
          <Button variant="contained" onClick={() => setOpenSaveModal(true)}>
            Save
          </Button>
          <Button variant="contained" onClick={() => setOpenLoadModal(true)}>
            Load
          </Button>
        </ButtonGroup>
        <Tooltip title="use (s/S) to toggle between views">
          <Button variant="contained" onClick={() => setShowList((v) => !v)}>
            {showList ? 'Show Report' : 'Show List'}
          </Button>
        </Tooltip>
        {!showList && (
          <Tooltip title="use (d/D) to open/close details">
            <Button variant="contained" onClick={() => setOpenDrawer((v) => !v)}>
              Details
            </Button>
          </Tooltip>
        )}
      </ControlsBar>
      <CommonModal
        input={false}
        openModal={openSaveModal}
        title="EXPORT JSON"
        text={JSON.stringify(ISFavourites)}
        handleClose={() => setOpenSaveModal(false)}
      />
      <CommonModal
        input={true}
        openModal={openLoadModal}
        title="IMPORT JSON"
        handleClose={() => setOpenLoadModal(false)}
        handleImport={handleImport}
      />
      {showList ? (
        <MySolutionsList solutionsList={listItems} />
      ) : (
        <DiagnosticReportCard
          sweepList={currentGeneralTask.swept_arguments}
          modelType={currentGeneralTask.model_type}
          changeCurrentImage={handleChangeCurrentImage}
          automationTasks={reportItems}
          generalViews={localStorageGeneralViews}
          setGeneralViews={setLocalStorageGeneralViews}
          namedFaultsView={localStorageNamedFaultsView}
          setNamedFaultsView={setLocalStorageNamedFaultsView}
          namedFaultsLocations={localStorageNamedFaultsLocations}
          setNamedFaultsLocations={setLocalStorageNamedFaultsLocations}
          regionalViews={localStorageRegionalViews}
          setRegionalViews={setLocalStorageRegionalViews}
          nonRegionalViews={localStorageNonRegionalViews}
          setNonRegionalViews={setLocalStorageNonRegionalViews}
          parentFaultViews={localStorageParentFaultViews}
          setParentFaultViews={setLocalStorageParentFaultViews}
          parentFault={localStorageParentFault as string}
          setParentFault={setLocalStorageParentFault}
          disableHotkey={disableHotkey}
          setDisableHotkey={setDisableHotkey}
        />
      )}
      {!showList && <GeneralTaskDetailDrawer generalTaskDetails={currentGeneralTask} openDrawer={openDrawer} />}
    </>
  );
};

export default MySolutions;

export const mySolutionsQuery = graphql`
  query MySolutionsQuery($id: [ID!]) {
    nodes(id_in: $id) {
      result {
        edges {
          node {
            __typename
            ... on AutomationTask {
              id
              parents {
                edges {
                  node {
                    parent {
                      ... on GeneralTask {
                        id
                        created
                        title
                        description #hover
                        model_type
                        swept_arguments
                        notes #hover
                        argument_lists {
                          k
                          v
                        }
                      }
                    }
                  }
                }
              }
              inversion_solution {
                id
                mfd_table_id
                meta {
                  k
                  v
                }
                tables {
                  table_id
                  table_type
                }
              }
            }
          }
        }
      }
    }
  }
`;
