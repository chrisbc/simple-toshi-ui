import React, { useEffect, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { Typography, Box, Card } from '@material-ui/core';
import { graphql } from 'babel-plugin-relay/macro';
import ControlsBar from '../common/ControlsBar';
import SelectControl from '../common/SelectControl';
import { InversionSolutionHazardTabQuery } from './__generated__/InversionSolutionHazardTabQuery.graphql';
import { XY } from '../../interfaces/common';
import { filterData, getHazardTableOptions } from '../../service/inversionSolution.service';
import MultiSelect from '../common/MultiSelect';

import { scaleOrdinal } from '@visx/scale';
import { LegendOrdinal } from '@visx/legend';
import { HazardTableFilteredData } from '../../interfaces/inversionSolutions';
import { AnimatedAxis, AnimatedLineSeries, Grid, Tooltip, XYChart } from '@visx/xychart';

interface InversionSolutionHazardTabProps {
  id: string;
}

const InversionSolutionHazardTab: React.FC<InversionSolutionHazardTabProps> = ({
  id,
}: InversionSolutionHazardTabProps) => {
  const data = useLazyLoadQuery<InversionSolutionHazardTabQuery>(inversionSolutionHazardTabQuery, { id });
  const options = getHazardTableOptions(data);

  const [location, setLocation] = useState<string>(options.location[0]);
  const [PGA, setPGA] = useState<string[]>([options.PGA[0]]);
  const [forecastTime, setForecastTime] = useState<string>(options.forecastTime[0]);
  const [gmpe, setGmpe] = useState<string>(options.gmpe[0]);
  const [backgroundSeismicity, setBackgroundSeismicity] = useState<string>(options.backgroundSeismicity[0]);

  const [filteredData, setFilteredData] = useState<HazardTableFilteredData>({});

  useEffect(() => {
    const filtered: HazardTableFilteredData = {};
    const pgaValues: string[] = [...PGA];
    if (pgaValues.includes('PGA')) {
      const index = pgaValues.indexOf('PGA');
      pgaValues[index] = '0.0';
    }

    pgaValues.map((pgaValue) => {
      const xy = filterData(data, location, pgaValue, forecastTime, gmpe, backgroundSeismicity);
      pgaValue === '0.0' ? (filtered['PGA'] = xy) : (filtered[pgaValue] = xy);
    });
    setFilteredData(filtered);
  }, [location, PGA, forecastTime, gmpe, backgroundSeismicity]);

  const handleSetPGA = (selections: string[]) => {
    setPGA(selections);
  };

  const colors = ['#FE1100', '#73d629', '#ffd700', '#7fe5f0', '#003366', '#ff7f50', '#047806', '#4ca3dd'];

  const ordinalColorScale = scaleOrdinal({
    domain: [...PGA],
    range: colors,
  });

  return (
    <>
      <Box>
        <Card>
          <Typography variant="h5" gutterBottom>
            <strong>Hazard:</strong>
            <ControlsBar>
              <SelectControl name="Location" options={options.location} setOptions={setLocation} />
              <MultiSelect name="PGA/SA Period" selected={[]} options={options.PGA} setOptions={handleSetPGA} />
              <SelectControl name="Forecast Timespan" options={options.forecastTime} setOptions={setForecastTime} />
              <SelectControl
                name="Background Seismicity"
                options={options.backgroundSeismicity}
                setOptions={setBackgroundSeismicity}
              />
              <SelectControl name="Background Motion Model" options={options.gmpe} setOptions={setGmpe} />
            </ControlsBar>
          </Typography>
          <Box style={{ width: '100%', padding: '1rem' }}>
            <XYChart
              height={700}
              width={900}
              xScale={{ type: 'log', domain: [1e-3, 10] }}
              yScale={{ type: 'log', domain: [1e-13, 2.0] }}
            >
              <AnimatedAxis orientation="bottom" />
              <AnimatedAxis orientation="left" />
              <text y={11} x={-500} transform="rotate(-90)" fontSize={15}>
                Annual Frequency of Exceedance
              </text>
              <text y={685} x={350} fontSize={15}>
                Ground Motion (g)
              </text>
              {Object.keys(filteredData).map((key, index) => {
                return (
                  <AnimatedLineSeries
                    key={key}
                    dataKey={key}
                    data={filteredData[key]}
                    xAccessor={(d: XY) => d?.x}
                    yAccessor={(d: XY) => d?.y}
                    stroke={colors[index]}
                  />
                );
              })}
              <Grid rows={true} columns={true} lineStyle={{ opacity: '90%' }} />
              <Tooltip
                showHorizontalCrosshair
                showVerticalCrosshair
                snapTooltipToDatumX
                snapTooltipToDatumY
                showDatumGlyph
                glyphStyle={{ fill: '#000' }}
                renderTooltip={({ tooltipData, colorScale }) => {
                  const datum = tooltipData?.nearestDatum?.datum as XY;
                  const key = tooltipData?.nearestDatum?.key as string;
                  if (datum) {
                    return (
                      <>
                        <Typography>
                          <span
                            style={{
                              background: colorScale && colorScale(key as string),
                              width: 8,
                              height: 8,
                              display: 'inline-block',
                              marginRight: 4,
                              borderRadius: 8,
                            }}
                          />
                          &nbsp;&nbsp;&nbsp;
                          {key === 'PGA' ? key : key + 's'}
                        </Typography>
                        <Typography>x: {datum.x.toExponential()}</Typography>
                        <Typography>y: {datum.y.toExponential()}</Typography>
                      </>
                    );
                  }
                }}
              />
            </XYChart>
            <div style={{ width: 100, height: 100, position: 'absolute', top: 400, left: 1000, display: 'flex' }}>
              <LegendOrdinal direction="column" scale={ordinalColorScale} shape="line" />
            </div>
          </Box>
        </Card>
      </Box>
    </>
  );
};

export default InversionSolutionHazardTab;

export const inversionSolutionHazardTabQuery = graphql`
  query InversionSolutionHazardTabQuery($id: ID!) {
    node(id: $id) {
      ... on Table {
        id
        name
        created
        table_type
        object_id
        column_headers
        column_types
        rows
        dimensions {
          k
          v
        }
      }
    }
  }
`;
