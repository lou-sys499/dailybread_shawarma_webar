import React from 'react';
import { DailyRunStatusCard, DailyRunStatusCardProps } from './DailyRunStatusCard';

export type DailyRunCardProps = DailyRunStatusCardProps;

/**
 * DailyRunCard is an alias/wrapper around DailyRunStatusCard for backwards compatibility.
 * Dynamically communicates 3 states: NEW, PROGRESS, REWARD EARNED.
 */
export const DailyRunCard: React.FC<DailyRunCardProps> = (props) => {
  return <DailyRunStatusCard {...props} />;
};

export default DailyRunCard;
