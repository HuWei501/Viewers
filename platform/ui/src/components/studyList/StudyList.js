import './StudyList.styl';

import React from 'react';
import classNames from 'classnames';
import TableSearchFilter from './TableSearchFilter.js';
import useMedia from '../../hooks/useMedia.js';
import PropTypes from 'prop-types';
import ColorHash from './internal/color-hash.js';
import { StudyListLoadingText } from './StudyListLoadingText.js';
import { useTranslation } from 'react-i18next';

const colorHash = new ColorHash();

/**
 *
 *
 * @param {*} props
 * @returns
 */
function StudyList(props) {
  const {
    isLoading,
    hasError,
    studies,
    sort,
    onSort: handleSort,
    filterValues,
    onFilterChange: handleFilterChange,
    onSelectItem: handleSelectItem,
    //
    studyListDateFilterNumDays,
  } = props;
  const { t, i18n, ready } = useTranslation('StudyList');
  const { t: t2, i18n: i18n2, ready: ready2 } = useTranslation('Common');

  const largeTableMeta = [
    {
      displayText: t2('More'),
      fieldName: 'patientName',
      inputType: 'text',
      size: 330,
    },
    {
      displayText: t('MRN'),
      fieldName: 'patientId',
      inputType: 'text',
      size: 378,
    },
    {
      displayText: t('AccessionNumber'),
      fieldName: 'accessionNumber',
      inputType: 'text',
      size: 180,
    },
    {
      displayText: t2('More'),
      fieldName: 'studyDate',
      inputType: 'date-range',
      size: 300,
    },
    {
      displayText: t('Modality'),
      fieldName: 'modalities',
      inputType: 'text',
      size: 114,
    },
    {
      displayText: t('StudyDescription'),
      fieldName: 'studyDescription',
      inputType: 'text',
      size: 335,
    },
  ];

  const mediumTableMeta = [
    {
      displayText: `${t2('More')} / ${t('MRN')}`,
      fieldName: 'patientNameOrId',
      inputType: 'text',
      size: 250,
    },
    {
      displayText: t('Description'),
      fieldName: 'accessionOrModalityOrDescription',
      inputType: 'text',
      size: 350,
    },
    {
      displayText: t('StudyDate'),
      fieldName: 'studyDate',
      inputType: 'date-range',
      size: 300,
    },
  ];

  const smallTableMeta = [
    {
      displayText: t('Search'),
      fieldName: 'allFields',
      inputType: 'text',
      size: 100,
    },
  ];

  const tableMeta = useMedia(
    ['(min-width: 1750px)', '(min-width: 1000px)', '(min-width: 768px)'],
    [largeTableMeta, mediumTableMeta, smallTableMeta],
    smallTableMeta,
    ready
  );


  if (!ready) {
    return null;
  }

  const totalSize = tableMeta
    .map(field => field.size)
    .reduce((prev, next) => prev + next);
  return (
    <table className="table table--striped table--hoverable">
      <colgroup>
        {tableMeta.map((field, i) => {
          const size = field.size;
          const percentWidth = (size / totalSize) * 100.0;

          return <col key={i} style={{ width: `${percentWidth}%` }} />;
        })}
      </colgroup>
      <thead className="table-head">
        <tr className="filters">
          <TableSearchFilter
            meta={tableMeta}
            values={filterValues}
            onSort={handleSort}
            onValueChange={handleFilterChange}
            sortFieldName={sort.fieldName}
            sortDirection={sort.direction}
            studyListDateFilterNumDays={studyListDateFilterNumDays}
          />
        </tr>
      </thead>
      <tbody className="table-body" data-cy="study-list-results">
        {/* I'm not in love with this approach, but it's the quickest way for now
         *
         * - Display different content based on loading, empty, results state
         *
         * This is not ideal because it create a jump in focus. For loading especially,
         * We should keep our current results visible while we load the new ones.
         */}
        {/* LOADING */}
        {isLoading && (
          <tr className="no-hover">
            <td colSpan={tableMeta.length}>
              <StudyListLoadingText />
            </td>
          </tr>
        )}
        {!isLoading && hasError && (
          <tr className="no-hover">
            <td colSpan={tableMeta.length}>
              <div className="notFound">
                {t('There was an error fetching studies')}
              </div>
            </td>
          </tr>
        )}
        {/* EMPTY */}
        {!isLoading && !studies.length && (
          <tr className="no-hover">
            <td colSpan={tableMeta.length}>
              <div className="notFound">{t('No matching results')}</div>
            </td>
          </tr>
        )}
        {!isLoading &&
          studies.map((study, index) => (
            <TableRow
              key={`${study.studyInstanceUid}-${index}`}
              onClick={studyInstanceUid => handleSelectItem(studyInstanceUid)}
              accessionNumber={study.accessionNumber || ''}
              modalities={study.modalities}
              patientId={study.patientId || ''}
              patientName={study.patientName || ''}
              studyDate={study.studyDate}
              studyDescription={study.studyDescription || ''}
              studyInstanceUid={study.studyInstanceUid}
              t={t}
              ready={ready}
            />
          ))}
      </tbody>
    </table>
  );
}

StudyList.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  hasError: PropTypes.bool.isRequired,
  studies: PropTypes.array.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  // ~~ SORT
  sort: PropTypes.shape({
    fieldName: PropTypes.string,
    direction: PropTypes.oneOf(['desc', 'asc', null]),
  }).isRequired,
  onSort: PropTypes.func.isRequired,
  // ~~ FILTERS
  filterValues: PropTypes.shape({
    patientName: PropTypes.string.isRequired,
    patientId: PropTypes.string.isRequired,
    accessionNumber: PropTypes.string.isRequired,
    studyDate: PropTypes.string.isRequired,
    modalities: PropTypes.string.isRequired,
    studyDescription: PropTypes.string.isRequired,
    patientNameOrId: PropTypes.string.isRequired,
    accessionOrModalityOrDescription: PropTypes.string.isRequired,
    allFields: PropTypes.string.isRequired,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  //
  studyListDateFilterNumDays: PropTypes.number,
};

StudyList.defaultProps = {};

function TableRow(props) {
  const {
    accessionNumber,
    isHighlighted,
    modalities,
    patientId,
    patientName,
    studyDate,
    studyDescription,
    studyInstanceUid,
    onClick: handleClick,
    t,
    ready,
  } = props;

  const largeRowTemplate = (
    <tr
      onClick={() => handleClick(studyInstanceUid)}
      className={classNames({ active: isHighlighted })}
    >
      <td className={classNames({ emptyCell: !patientName })}>
        {patientName || `(${t('Empty')})`}
      </td>
      <td>{patientId}</td>
      <td>{accessionNumber}</td>
      <td>{studyDate}</td>
      <td>{modalities}</td>
      <td>{studyDescription}</td>
    </tr>
  );

  const mediumRowTemplate = (
    <tr
      onClick={() => handleClick(studyInstanceUid)}
      className={classNames({ active: isHighlighted })}
    >
      <td className={classNames({ emptyCell: !patientName })}>
        {patientName || `(${t('Empty')})`}
        <div style={{ color: '#60656f' }}>{patientId}</div>
      </td>
      <td>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* DESCRIPTION */}
          <div
            className="hide-xs"
            style={{
              whiteSpace: 'pre-wrap',
              flexGrow: 1,
            }}
          >
            {studyDescription}
          </div>

          {/* MODALITY & ACCESSION */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: '80px',
              maxWidth: '100px',
            }}
          >
            <div
              style={{
                backgroundColor: colorHash.hex(modalities),
                borderRadius: '16px',
                padding: '2px 8px 0px 8px',
                fontWeight: 500,
                marginBottom: '4px',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              aria-label={modalities}
              title={modalities}
            >
              {modalities}
            </div>
            <div
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              aria-label={accessionNumber}
              title={accessionNumber}
            >
              {accessionNumber}
            </div>
          </div>
        </div>
      </td>
      {/* DATE */}
      <td style={{ textAlign: 'center' }}>{studyDate}</td>
    </tr>
  );

  const smallRowTemplate = (
    <tr
      onClick={() => handleClick(studyInstanceUid)}
      className={classNames({ active: isHighlighted })}
    >
      <td style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* NAME AND ID */}
          <div
            className={classNames({ emptyCell: !patientName })}
            style={{ width: '150px', minWidth: '150px' }}
          >
            <div style={{ fontWeight: 500, paddingTop: '3px' }}>
              {patientName || `(${t('Empty')})`}
            </div>
            <div style={{ color: '#60656f' }}>{patientId}</div>
          </div>

          {/* DESCRIPTION */}
          <div
            className="hide-xs"
            style={{
              whiteSpace: 'pre-wrap',
              flexGrow: 1,
              paddingLeft: '35px',
            }}
          >
            {studyDescription}
          </div>

          {/* MODALITY & DATE */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: '80px',
            }}
          >
            <div
              style={{
                backgroundColor: colorHash.hex(modalities),
                borderRadius: '16px',
                padding: '2px 8px 0px 8px',
                fontWeight: 500,
                marginBottom: '4px',
              }}
            >
              {modalities}
            </div>
            <div>{studyDate}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  const rowTemplate = useMedia(
    ['(min-width: 1750px)', '(min-width: 1000px)', '(min-width: 768px)'],
    [largeRowTemplate, mediumRowTemplate, smallRowTemplate],
    smallRowTemplate,
    ready
  );

  return rowTemplate;
}

TableRow.propTypes = {
  accessionNumber: PropTypes.string.isRequired,
  isHighlighted: PropTypes.bool,
  modalities: PropTypes.string.isRequired,
  patientId: PropTypes.string.isRequired,
  patientName: PropTypes.string.isRequired,
  studyDate: PropTypes.string.isRequired,
  studyDescription: PropTypes.string.isRequired,
  studyInstanceUid: PropTypes.string.isRequired,
};

TableRow.defaultProps = {
  isHighlighted: false,
};

export { StudyList };
