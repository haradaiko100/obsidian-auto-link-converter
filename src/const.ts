/**
 * User-facing messages used across the plugin (commands, paste handler, notices, etc.)
 */

export const SUCCESS_MESSAGE = 'Links converted successfully';
export const NO_LINKS_FOUND_MESSAGE = 'No links found in selection';
export const FAILED_TO_CONVERT_MESSAGE = 'Failed to convert links';

export interface ConvertedResult {
	// whether the conversion process was successful
	success: boolean;
	// message to display to the user
	message: string;
}