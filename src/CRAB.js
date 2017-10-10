import querystring from 'querystring';
import fetch from 'node-fetch';

const CRAB = async (operation, parameters) => {
  const URL = 'http://crab.agiv.be/Examples/Home/ExecOperation';
  const method = 'post';
  const headers = { 'Content-type': 'application/x-www-form-urlencoded' };
  const entriesToNameValue = ([Name, Value]) => ({ Name, Value });
  const params = Object.entries(
    Object.assign({ SorteerVeld: 0 }, parameters),
  ).map(entriesToNameValue);
  const body = querystring.stringify({
    operation,
    parametersJson: JSON.stringify(params),
  });
  const response = await fetch(URL, { method, headers, body });
  const table = await response.text();
  const strip = /^<td>|<(\/?)(b|i)>|<\/td>$/g;
  const splitRows = '</tr><tr>';
  const splitColumns = '</td><td>';
  const rows = table
    .replace("<table border='1' cellspacing='0'><tr>", '')
    .replace('</tr></table>', '')
    .split(splitRows);
  const columns = rows
    .shift()
    .replace(strip, '')
    .split(splitColumns);
  const column = (col, index) => ({ [columns[index]]: col });
  const items = rows.map(row =>
    Object.assign(
      {},
      ...row
        .replace(strip, '')
        .split(splitColumns)
        .map(column),
    ),
  );
  return items;
};

export default CRAB;
