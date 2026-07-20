import React from "react";

export const inputValue = event => event.target.type === "checkbox" ? event.target.checked : event.target.value;
export const money = (minor, currency = "USD") => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(minor || 0) / 100);
export const dateTime = value => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export function Notice({ type = "info", children }) {
  return children ? <p className={`admin-notice admin-notice--${type}`}>{children}</p> : null;
}

export function Spinner() {
  return <div className="admin-spinner" role="status">Loading…</div>;
}

export function Empty({ children = "No records found." }) {
  return <div className="admin-empty">{children}</div>;
}

export function PageHeader({ eyebrow = "Administration", title, actions }) {
  return <header className="admin-page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><div className="admin-header-actions">{actions}</div></header>;
}

export function DataTable({ columns, rows, onRow }) {
  if (!rows.length) return <Empty />;
  return <div className="table-wrap"><table><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((cells, index) => <tr key={index} onClick={onRow ? () => onRow(index) : undefined} className={onRow ? "is-clickable" : ""}>{cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

export function useLoader(loader, dependencies = []) {
  const [state, setState] = React.useState({ loading: true, data: null, error: "" });
  const refresh = React.useCallback(() => {
    setState(current => ({ ...current, loading: true, error: "" }));
    return loader()
      .then(data => { setState({ loading: false, data, error: "" }); return data; })
      .catch(error => { setState({ loading: false, data: null, error: error.message }); throw error; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  React.useEffect(() => { refresh().catch(() => {}); }, [refresh]);
  return { ...state, refresh, setData: data => setState({ loading: false, data, error: "" }) };
}

export function JsonEditor({ label, value, onChange, rows = 10, readOnly = false }) {
  const [text, setText] = React.useState(() => JSON.stringify(value ?? {}, null, 2));
  React.useEffect(() => { setText(JSON.stringify(value ?? {}, null, 2)); }, [value]);
  return <label>{label}<textarea
    rows={rows}
    value={text}
    readOnly={readOnly}
    aria-readonly={readOnly}
    onChange={event => {
      if (readOnly) return;
      setText(event.target.value);
      try { onChange(JSON.parse(event.target.value)); } catch { /* Keep editing until JSON is valid. */ }
    }}
  /></label>;
}
