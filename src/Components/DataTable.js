import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';
import img from '../Images/projectimg.jpg';
import dummyUser from '../Images/dummyUser.jpg'
import { encryptId } from '../encryption';

const DataTable = ({
  columns = [],
  data = [],
  pagination = { page: 1, per_page: 10, total: 0, total_pages: 1 },
  expandedRowContent,
  index = true,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRegularization,
  onInfo,
  editButton,
  displayText,
  deleteButton,
  approveButton,
  rejectButton,
  regularizationButton,
  infoButton,
  onClickNext,
  onClickPrevious,
  onPageSizeChange,
  clickableRow = false,
  footer = true,
  onPaginationChange,
  pageCount = 0,
  loading = false,
  ApproveText = 'Approve',
  RejectText = 'Reject',
  error = null,
}) => {

  // Prepare columns for react-table
  const tableColumns = useMemo(() => {
    const safeColumns = Array.isArray(columns) ? columns : [];

    const baseColumns = [
      ...(expandedRowContent ? [{
        id: 'expander',
        header: '',
        cell: ({ row }) => (
          <i
            className={`fa-solid ${row.getIsExpanded() ? 'fa-chevron-down' : 'fa-chevron-right'}`}
            style={{ cursor: 'pointer', fontSize: '16px' }}
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
          />
        ),
        size: 10
      }] : []),
      ...(index ? [{
        header: '#',
        accessorKey: 'index',
        cell: ({ row }) => ((pagination?.page - 1) * pagination?.per_page + row?.index + 1),
        size: 10,
      }] : []),
      ...safeColumns.map(column => {
        const safeColumn = {
          Header: column.Header || '',
          accessor: column.accessor || '',
          selector: column.selector || '',
          format: column.format,
          ...column
        };

        return {
          ...safeColumn,
          header: safeColumn.Header,
          accessorKey: safeColumn.accessor || safeColumn.selector,
          size: 30,
          cell: ({ row, getValue }) => {
            const value = getValue();

            if (safeColumn.Header === 'Project' && safeColumn.accessor === 'name' && value) {
              return (
                <>
                  <img
                    src={row.original.imageURL || img}
                    alt={''}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      marginRight: '8px',
                      alignItems: 'center'
                    }}
                  />
                  <a
                    href={`/productivity/projects/details/${encryptId(row.original.id)}`}
                    style={{ color: '#338db5' }}
                    className="text-truncate"
                    title={row.original.name}
                  >
                    {row.original.name}
                  </a>
                </>
              );
            } else if (safeColumn.Header === 'Image' && safeColumn.accessor === 'imageURL') {
              return (
                <img
                  src={row.original.imageURL ? row.original.imageURL : dummyUser}
                  alt={'Hello'}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    marginLeft: '10px',
                    marginRight: '8px'
                  }}
                />
              )
            }
            else if (((safeColumn.Header === 'Code' && safeColumn.accessor === 'code') || (safeColumn.Header === 'Task' && safeColumn.accessor === 'taskCode')) && value) {
              return (
                <>
                  <a
                    href={`/productivity/tasks/${(value)}`}
                    style={{ color: '#338db5' }}
                    className="text-truncate"
                    title={row.original.name}
                  >
                    {value}
                  </a>
                </>
              );
            }
            else if (safeColumn.Header === 'Location') {
              return (
                <>
                  {row.original.latitude && row.original.longitude ? (
                    <a
                      href={`https://www.google.com/maps/search/?q=${encodeURIComponent(row.original.latitude)},${encodeURIComponent(row.original.longitude)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#338db5', display: 'block', alignItems: 'center' }}
                    >
                      View
                    </a>
                  ) : (
                    <p className='mb-0'>No Coordinates</p>
                  )}
                </>
              );
            }

            return (
              <div
                style={{
                  wordBreak: 'normal',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  display: 'block'
                }}
                title={value}
              >
                {value}
              </div>
            );
          }
        };
      }),
      ...((editButton || deleteButton || approveButton || rejectButton || regularizationButton) ? [{
        header: 'Action',
        id: 'action',
        className: 'text-end pe-2 w-10',
        cell: ({ row }) => {
          const showEdit = typeof editButton === 'function' ? editButton(row.original) : editButton;
          const showDelete = typeof deleteButton === 'function' ? deleteButton(row.original) : deleteButton;
          const showApprove = typeof approveButton === 'function' ? approveButton(row.original) : approveButton;
          const showReject = typeof rejectButton === 'function' ? rejectButton(row.original) : rejectButton;
          const showRegularization = typeof regularizationButton === 'function' ? regularizationButton(row.original) : regularizationButton;
          const showInfo = typeof infoButton === 'function' ? infoButton(row.original) : infoButton;
          const text = typeof displayText === 'function' ? displayText(row.original) : displayText;

          if (showEdit || showDelete) {
            return (
              <>
                <div className='button-to-right'>
                  {showEdit && (
                    <button
                      className="btn bgnone m-0 p-0"
                      onClick={() => onEdit?.(row.original)}
                      style={{ height: '30px', width: '30px', color: '#338db5' }}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  )}
                  {showDelete && (
                    <button
                      className="btn bgnone m-0 p-0"
                      onClick={() => onDelete?.(row.original)}
                      style={{ color: '#fd6e6e' }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}

                </div>
              </>
            );
          } else if (showApprove || showReject || displayText) {
            return (
              <div className='button-to-right'>
                {showApprove && (
                  <button
                    className="btn bgnone btn-outline-success m-1 py-1"
                    onClick={() => onApprove?.(row.original)}
                    style={{ marginRight: '5px', fontSize: '13px', color: 'green' }}
                  >
                    {ApproveText}
                  </button>
                )}
                {showReject && (
                  <button
                    className="btn bgnone btn-outline-danger my-1 py-1"
                    onClick={() => onReject?.(row.original)}
                    style={{ color: 'danger', fontSize: '13px', color: 'red' }}
                  >
                    {RejectText}
                  </button>
                )}
                {text && (
                  <div
                  style={{
                    wordBreak: 'normal',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    display: 'block',
                    alignContent: 'center'
                  }}
                  title={text}
                >
                    {text}
                  </div>
                )}
              </div>
            );
          } else if (showRegularization || showInfo) {
            return (
              <div className='button-to-right'>
                {showRegularization && (
                  <button
                    className="btn bgnone m-0 p-0"
                    onClick={() => onRegularization?.(row.original)}
                    style={{ height: '30px', width: '30px', color: 'rgb(206 206 10)' }}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                )}
                {showInfo && (
                  <button
                    className="btn bgnone m-0 p-0"
                    onClick={() => onInfo?.(row.original)}
                    style={{ height: '30px', width: '30px', color: '#338db5' }}
                  >
                    <i className="fa-solid fa-circle-info"></i>
                  </button>
                )}

              </div>
            );
          }
          return null;
        }
      }] : [])
    ];

    return baseColumns;
  }, [columns, expandedRowContent, editButton, deleteButton, approveButton, rejectButton, regularizationButton]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: onPaginationChange,
  });

  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <div className="expanded-row-content">
        {expandedRowContent?.(row.original) || null}
      </div>
    ),
    [expandedRowContent]
  );

  return (
    <>
      <div className="datatable-container">
        {loading && (
          <div className="spinner-border" role="status" style={{ color: '#338db5' }}>
            <span className="sr-only">Loading...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
            <button
              className="btn bgnone btn-sm btn-link"
              onClick={() => { }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className='datatable-wrapper'>
          <table className="datatable">
            <thead className='px-1'>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} style={{ backgroundColor: '#c1dde9', height: '40px' }}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{
                        cursor: 'pointer',
                        width: 'auto',
                        textAlign: header.id === 'expander' || header.id === 'index' ? 'center' : 'left'
                      }}
                      className={header?.column?.columnDef?.className ? header?.column?.columnDef?.className : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <i className="fa-solid fa-angle-up" style={{ marginLeft: '5px' }} />,
                        desc: <i className="fa-solid fa-angle-down" style={{ marginLeft: '5px' }} />,
                      }[header.column.getIsSorted()] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className='px-1'>
              {table.getRowModel().rows?.length > 0 ? (
                table.getRowModel().rows.map((row, i) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={i % 2 === 0 ? 'even' : 'odd'}
                      style={{ cursor: clickableRow ? 'pointer' : 'default' }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          style={{
                            textAlign: cell.column.id === 'expander' || cell.column.id === 'index' ? 'center' : 'left',
                            width: cell.column.id === 'action' ? '60px' : 'auto',
                          }}
                          className=''
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length}>
                          {renderRowSubComponent({ row })}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={tableColumns.length} style={{ textAlign: 'center' }}>
                    {loading ? 'Loading...' : 'No data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {footer && (
        <div className="footer">
          <div className="footer-left px-3">
            <button
              className="btn bgnone btn-outline-secondary"
              disabled={pagination?.page === 1}
              onClick={onClickPrevious}
            >
              <i className='fa-solid fa-chevron-left'></i>
              <span className="btn-text d-none d-sm-inline">Previous</span>
            </button>
          </div>
          <div className='mt-2' style={{ textAlign: 'center' }}>
            <span>
              page {pagination?.page || 1} of {pagination?.total_pages || 1}
            </span>

            <select
              className="btn bgnone px-2 py-1 mx-2 "
              style={{ border: '1px solid' }}
              disabled={loading}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize); // Use the new prop
              }}
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="footer-right px-3">
            <button
              className="btn bgnone btn-outline-secondary"
              disabled={pagination?.page === pagination?.total_pages}
              onClick={onClickNext}
            >
              <span className="text d-none d-sm-inline">Next</span>
              <i className="fa-solid fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;