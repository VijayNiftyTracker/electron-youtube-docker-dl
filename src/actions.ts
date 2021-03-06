import {VideoInfo} from './downloader';

type Origin = 'renderer' | 'main';

const origin: Origin = (typeof(window) === 'undefined')
                       ? 'main' : 'renderer';

export interface SyncableAction {
  type: string;
  origin?: Origin;
}

interface SimpleAction extends SyncableAction {
  type: 'shutdown';
}

interface LogAction extends SyncableAction {
  type: 'log';
  message: string;
}

interface SimpleUrlAction extends SyncableAction {
  type: 'enqueueDownload' | 'startDownload' | 'finishDownload' |
        'cancelDownload' | 'retryDownload';
  url: string;
}

interface UrlLogAction extends SyncableAction {
  type: 'urllog';
  url: string;
  message: string;
}

interface PreparedAction extends SyncableAction {
  type: 'downloadPrepared';
  url: string;
  videoInfo: VideoInfo;
}

interface ErrorAction extends SyncableAction {
  type: 'downloadError';
  url: string;
  message: string;
}

export type Action = (
  {type: 'init', origin?: undefined} |
  {type: '@@redux/INIT', origin?: undefined} |
  SimpleAction |
  LogAction |
  SimpleUrlAction |
  UrlLogAction |
  PreparedAction |
  ErrorAction
);

function ensureOrigin(o: Origin): void {
  if (origin !== o) {
    throw new Error(`action should only be created in the ${o} process`);
  }
}

/**
 * First-time intialization, run at startup.
 */
export function init(): Action {
  ensureOrigin('main');
  return {type: 'init'};
};

/**
 * Shut down the app.
 */
export function shutdown(): SimpleAction {
  ensureOrigin('main');
  return {type: 'shutdown'};
};

/**
 * Log a generic message that isn't specific to a particular download.
 */
export function log(message: string): LogAction {
  return {type: 'log', message};
}

/**
 * Log a message that is specific to a particular download.
 */
export function downloadLog(url: string, message: string): UrlLogAction {
  return {type: 'urllog', url, message};
}

/**
 * Enqueue a video for being downloaded, adding it to the
 * end of the queue.
 */
export function enqueueDownload(url: string): SimpleUrlAction {
  return {type: 'enqueueDownload', url};
}

/**
 * Start a download.
 */
export function startDownload(url: string): SimpleUrlAction {
  ensureOrigin('main');
  return {type: 'startDownload', url};
}

/**
 * Successfully finish a download.
 */
export function finishDownload(url: string): SimpleUrlAction {
  ensureOrigin('main');
  return {type: 'finishDownload', url};
}

/**
 * Cancel a download, removing it from the download queue.
 */
export function cancelDownload(url: string): SimpleUrlAction {
  return {type: 'cancelDownload', url};
}

/**
 * Retry a download that errored.
 */
export function retryDownload(url: string): SimpleUrlAction {
  return {type: 'retryDownload', url};
}

/**
 * Signal that a download is prepared, i.e. that its metadata has
 * been retrieved.
 */
export function downloadPrepared(url: string,
                                 videoInfo: VideoInfo): PreparedAction {
  ensureOrigin('main');
  return {type: 'downloadPrepared', url, videoInfo};
}

/**
 * Signal that an error occurred while trying to download.
 */
export function downloadError(url: string, message: string): ErrorAction {
  ensureOrigin('main');
  return {type: 'downloadError', url, message};
}
