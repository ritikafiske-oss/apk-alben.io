/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import { Controller, Get, Query, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { SystemLogsService } from './system-logs.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { ExceptionHandler } from '@libs/common';

@ApiExcludeController()
@Controller('system-logs-view')
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @Get()
  getLogsView(@Query('type') type: string, @Res() res: Response) {
    try {
      const categories = this.systemLogsService.getAvailableCategories();

      // Prioritize exact match from query parameter, then fallback to latest api_logs
      const selectedCategory =
        (type && categories.includes(type) && type) ||
        categories.find((c) => c.startsWith('api_logs')) ||
        categories[0] ||
        'api_logs';

      const logs = this.systemLogsService.getLogsForCategory(selectedCategory);

      const html = this.renderHtml(categories, selectedCategory, logs);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Get('download')
  downloadLog(@Query('type') type: string, @Res() res: Response) {
    const filePath = this.systemLogsService.getLogFilePath(type);
    if (!filePath) {
      throw new NotFoundException('Log file not found');
    }
    res.download(filePath);
  }

  @Get('delete')
  deleteLog(@Query('type') type: string, @Res() res: Response) {
    this.systemLogsService.deleteLog(type);
    res.redirect('/system-logs-view');
  }

  @Get('reset')
  resetLog(@Query('type') type: string, @Res() res: Response) {
    this.systemLogsService.resetLog(type);
    res.redirect(`/system-logs-view?type=${type}`);
  }

  private renderHtml(
    categories: string[],
    selectedCategory: string,
    logs: any[],
  ): string {
    // Basic HTML string with DataTables
    const categoriesOptions = categories
      .map(
        (cat) =>
          `<option value="${cat}" ${cat === selectedCategory ? 'selected' : ''}>${cat.replace(/-/g, '_')}</option>`,
      )
      .join('');

    const tableHeaders = selectedCategory.startsWith('api_logs')
      ? `<th>Timestamp</th><th>Method</th><th class="url-col">URL</th><th>IP</th><th>User ID</th><th>Status</th><th>Time (s)</th><th>Size (KB)</th><th>Bodies</th>`
      : `<th>Timestamp</th><th>Message/Error</th><th>Status</th><th>Time (s)</th><th>Context/Details</th>`;

    const tableRows = logs
      .map((log) => {
        const ts = new Date(log.timestamp).toLocaleString();

        if (selectedCategory.startsWith('api_logs')) {
          const reqData =
            typeof log.message === 'object' && log.message !== null
              ? log.message
              : log;
          return `
          <tr>
            <td data-order="${new Date(log.timestamp).getTime()}">${ts}</td>
            <td><span class="badge ${this.getMethodColor(reqData.METHOD)}">${reqData.METHOD || '-'}</span></td>
            <td class="url-col">${reqData.URL || '-'}</td>
            <td>${reqData.IP || '-'}</td>
            <td>${reqData.USER_ID !== undefined ? reqData.USER_ID : '-'}</td>
            <td>${reqData.STATUS || '-'}</td>
            <td>${reqData.EXECUTION_TIME !== undefined ? reqData.EXECUTION_TIME : '-'}</td>
            <td><small>Req: ${reqData.REQUEST_KB || 0}kB<br>Res: ${reqData.RESPONSE_KB || 0}kB<br><strong>Total: ${reqData.TOTAL_KB || 0}kB</strong></small></td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick='showDetails(${JSON.stringify(reqData.REQUEST_BODY || {}).replace(/'/g, '&apos;')}, ${JSON.stringify(reqData.RESPONSE || {}).replace(/'/g, '&apos;')})'>View</button>
            </td>
          </tr>
        `;
        } else {
          // generic log or exception
          let msg = log.message || log.exception?.message || '-';
          let status = log.level || log.statusCode || '-';
          let execTime = '-';

          if (typeof msg === 'object' && msg !== null) {
            if (msg.STATUS !== undefined) status = msg.STATUS;
            else if (msg.statusCode !== undefined) status = msg.statusCode;

            if (msg.EXECUTION_TIME !== undefined) execTime = msg.EXECUTION_TIME;

            if (msg.message) {
              msg = Array.isArray(msg.message)
                ? msg.message.join(', ')
                : msg.message;
            } else if (msg.URL) {
              msg = msg.URL;
            } else {
              msg = '[Complex Object - Click View JSON]';
            }
          }

          return `
          <tr>
            <td data-order="${new Date(log.timestamp).getTime()}">${ts}</td>
            <td>${msg}</td>
            <td>${status}</td>
            <td>${execTime}</td>
            <td>
               <button class="btn btn-sm btn-outline-secondary" onclick='showGenericDetails(${JSON.stringify(log).replace(/'/g, '&apos;')})'>View JSON</button>
            </td>
          </tr>
        `;
        }
      })
      .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Logs Viewer</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <style>
      body { padding: 20px; background-color: #f8f9fa; }
      .container-fluid { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      /* Remove max-height from pre so it fills the fullscreen modal */
      pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-y: auto; height: 100%; white-space: pre-wrap; word-wrap: break-word; }
      #apiViews, #genericViews { height: 100%; display: flex; flex-direction: column; }
      .modal-body { display: flex; flex-direction: column; }
      .json-container { flex: 1; min-height: 0; display: flex; flex-direction: column; }
      .url-col {
        width: 40%;
        min-width: 400px;
        word-break: break-all;
        white-space: normal !important;
      }
    </style>
</head>
<body>

<div class="container-fluid flex-grow-1 d-flex flex-column h-100">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>System Logs Viewer</h2>
        <form class="d-flex align-items-center" method="GET" action="/system-logs-view">
            <select name="type" class="form-select me-2" onchange="this.form.submit()">
                ${categoriesOptions || '<option disabled selected>No logs found</option>'}
            </select>
            <button type="submit" class="btn btn-primary shadow-sm me-3">Refresh</button>
            <div class="btn-group shadow-sm">
                <a href="/system-logs-view/download?type=${selectedCategory}" class="btn btn-outline-success">Download</a>
                <button type="button" class="btn btn-outline-warning" onclick="confirmReset()">Reset</button>
                <button type="button" class="btn btn-outline-danger" onclick="confirmDelete()">Delete</button>
            </div>
        </form>
    </div>

    <div class="table-responsive">
      <table id="logsTable" class="table table-hover table-bordered" style="width:100%">
          <thead class="table-light">
              <tr>
                  ${tableHeaders}
              </tr>
          </thead>
          <tbody>
              ${tableRows}
          </tbody>
      </table>
    </div>
</div>

<!-- Modal -->
<div class="modal fade" id="detailsModal" tabindex="-1">
  <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header bg-light">
        <h5 class="modal-title">Log Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div id="apiViews" style="display:none;" class="json-container">
            <h6><span class="badge bg-secondary">Request Body</span></h6>
            <pre id="reqBodyView" class="flex-grow-1"></pre>
            <hr>
            <h6><span class="badge bg-info text-dark">Response Body / Data</span></h6>
            <pre id="resBodyView" class="flex-grow-1"></pre>
        </div>
        <div id="genericViews" style="display:none;" class="json-container">
            <h6>Raw JSON Details</h6>
            <pre id="genericLogView" class="flex-grow-1"></pre>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script>
    $(document).ready(function() {
        $('#logsTable').DataTable({
            order: [[0, 'desc']],
            pageLength: 50
        });
    });

    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));

    function showDetails(req, res) {
        document.getElementById('apiViews').style.display = 'block';
        document.getElementById('genericViews').style.display = 'none';
        
        const reqView = document.getElementById('reqBodyView');
        reqView.textContent = JSON.stringify(req, null, 2);
        
        // Collapse request body space if it's empty
        if (!req || Object.keys(req).length === 0) {
            reqView.style.flex = '0 0 auto';
            reqView.style.height = 'auto';
        } else {
            reqView.style.flex = '1 1 auto'; 
            reqView.style.height = '100%';
        }

        const resView = document.getElementById('resBodyView');
        resView.textContent = JSON.stringify(res, null, 2);
        
        // Collapse response body space if it's empty
        if (!res || Object.keys(res).length === 0 || (typeof res === 'string' && res.trim() === '')) {
            resView.style.flex = '0 0 auto';
            resView.style.height = 'auto';
        } else {
            resView.style.flex = '1 1 auto'; 
            resView.style.height = '100%';
        }

        modal.show();
    }

    function showGenericDetails(logObj) {
        document.getElementById('apiViews').style.display = 'none';
        document.getElementById('genericViews').style.display = 'block';
        
        document.getElementById('genericLogView').textContent = JSON.stringify(logObj, null, 2);
        modal.show();
    }

    function confirmReset() {
        if (confirm('Are you sure you want to empty this log file? This cannot be undone.')) {
            window.location.href = '/system-logs-view/reset?type=' + document.querySelector('select[name="type"]').value;
        }
    }

    function confirmDelete() {
        if (confirm('Are you sure you want to PERMANENTLY DELETE this log file?')) {
            window.location.href = '/system-logs-view/delete?type=' + document.querySelector('select[name="type"]').value;
        }
    }
</script>
</body>
</html>
    `;
  }

  private getMethodColor(method: string): string {
    switch (method?.toUpperCase()) {
      case 'GET':
        return 'bg-success';
      case 'POST':
        return 'bg-primary';
      case 'PUT':
        return 'bg-warning text-dark';
      case 'DELETE':
        return 'bg-danger';
      case 'PATCH':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  }
}
