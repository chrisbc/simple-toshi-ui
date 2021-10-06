import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { Card, CardContent, IconButton, makeStyles, Typography } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import buildUrl from 'build-url-ts';

import { inversionSolutionDiagnosticContainerQuery } from './InversionSolutionDiagnosticContainer';
import { ValidatedSubtask, SweepArguments } from '../../interfaces/generaltask';
import { InversionSolutionDiagnosticContainerQuery } from './__generated__/InversionSolutionDiagnosticContainerQuery.graphql';
import FavouriteControls from '../common/FavouriteControls';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  buttonContainer: {
    paddingLeft: '25%',
    paddingRight: '25%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingLeft: 70,
    paddingRight: 70,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  image: {
    padding: '5px',
    maxHeight: '80vh',
    width: '25%',
    objectFit: 'contain',
    flexGrow: 3,
    flexShrink: 4,
  },
}));

const reportBaseUrl = process.env.REACT_APP_REPORTS_URL;
interface DiagnosticReportsCardProps {
  readonly sweepArgs?: SweepArguments;
  queryRef: PreloadedQuery<InversionSolutionDiagnosticContainerQuery, Record<string, unknown>>;
  finalPath: string[];
}

const DiagnosticReportsCard: React.FC<DiagnosticReportsCardProps> = ({
  sweepArgs,
  queryRef,
  finalPath,
}: DiagnosticReportsCardProps) => {
  const classes = useStyles();
  const [currentImage, setCurrentImage] = useState<number>(0);
  const data = usePreloadedQuery<InversionSolutionDiagnosticContainerQuery>(
    inversionSolutionDiagnosticContainerQuery,
    queryRef,
  );
  const subtasks = data?.nodes?.result?.edges.map((subtask) => subtask?.node);
  const validatedSubtasks: ValidatedSubtask[] = [];

  subtasks?.map((subtask) => {
    if (
      subtask &&
      subtask !== null &&
      subtask.__typename === 'AutomationTask' &&
      subtask.inversion_solution !== null &&
      subtask.inversion_solution.meta !== null
    ) {
      const newSubtask: ValidatedSubtask = {
        __typename: 'AutomationTask',
        id: subtask.id,

        inversion_solution: {
          id: subtask.inversion_solution.id,
          meta: [],
        },
      };
      subtask.inversion_solution.meta.map((kv) => {
        kv !== null &&
          sweepArgs?.some((argument) => argument?.k?.includes(kv.k as string)) &&
          newSubtask.inversion_solution.meta.push(kv);
      });
      validatedSubtasks.push(newSubtask);
    }
  });

  const reportUrl = (finalPath: string, id: string) => {
    return buildUrl(reportBaseUrl, {
      path: `/opensha/DATA/${id}/solution_report/resources/${finalPath}`,
    });
  };

  const nextImage = () => {
    currentImage < validatedSubtasks.length - 1 && setCurrentImage(currentImage + 1);
  };

  const prevImage = () => {
    currentImage > 0 && setCurrentImage(currentImage - 1);
  };

  const hotkeyHandler = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') nextImage();
    if (event.key === 'ArrowLeft') prevImage();
  };

  useEffect(() => {
    window.addEventListener('keyup', hotkeyHandler);
    return () => window.removeEventListener('keyup', hotkeyHandler);
  }, [currentImage]);

  if (!subtasks || subtasks.length === 0) {
    return <Typography> Filter query has not run. </Typography>;
  }

  if (!validatedSubtasks[currentImage]) {
    return <Typography> There are no valid reports to show. </Typography>;
  }

  return (
    <>
      <Card className={classes.root}>
        <CardContent>
          <h4>
            Inversion Solution {validatedSubtasks[currentImage].inversion_solution.id}&nbsp;&nbsp;&nbsp;
            <Link to={`/InversionSolution/${validatedSubtasks[currentImage].inversion_solution.id}`}>[more]</Link>
          </h4>
          <Typography>
            {validatedSubtasks[currentImage].inversion_solution.meta.map((kv) => (
              <span key={kv?.k}>
                {kv?.k}: {kv?.v}, &nbsp;
              </span>
            ))}
          </Typography>
          <div className={classes.buttonContainer}>
            <IconButton className={classes.button} color="primary" onClick={prevImage} disabled={currentImage === 0}>
              <ArrowBackIosIcon />
            </IconButton>
            <Typography>
              {currentImage + 1}&nbsp;of&nbsp;{validatedSubtasks.length}
            </Typography>
            <IconButton
              className={classes.button}
              color="primary"
              onClick={nextImage}
              disabled={currentImage === validatedSubtasks.length - 1}
            >
              <ArrowForwardIosIcon />
            </IconButton>
            <FavouriteControls
              id={validatedSubtasks[currentImage].inversion_solution.id}
              producedBy={validatedSubtasks[currentImage].id}
            />
          </div>
          <div className={classes.imageContainer}>
            {finalPath.map((path) => (
              <img
                key={path}
                className={classes.image}
                src={reportUrl(path, validatedSubtasks[currentImage].inversion_solution.id)}
                alt={path}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DiagnosticReportsCard;
