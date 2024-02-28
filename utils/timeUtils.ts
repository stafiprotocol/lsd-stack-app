import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * format date with template
 * @param millis millisecond timestamp
 * @param template format template
 * @returns formatted time
 */
export function formatDate(
  millis: number,
  template: string = 'YYYY-M-D HH:mm'
) {
  return dayjs.utc(millis).format(template);
}

export function formatDuration(milliSeconds: number) {
  if (milliSeconds <= 0 || isNaN(milliSeconds)) {
    return '0 D';
  }
  const sec_num = (milliSeconds / 1000).toFixed(0);
  const months = Math.floor(Number(sec_num) / (3600 * 24 * 30)).toString();
  const weeks = Math.floor(Number(sec_num) / (3600 * 24 * 7)).toString();
  var days = Math.floor(Number(sec_num) / (3600 * 24)).toString();
  var hours = Math.floor(
    (Number(sec_num) - Number(days) * 3600 * 24) / 3600
  ).toString();
  var minutes = Math.floor(
    (Number(sec_num) - Number(days) * 3600 * 24 - Number(hours) * 3600) / 60
  ).toString();
  var seconds = (
    Number(sec_num) -
    Number(days) * 3600 * 24 -
    Number(hours) * 3600 -
    Number(minutes) * 60
  ).toString();

  if (Number(months) > 0) {
    return `${months} Months`;
  }
  if (Number(weeks) > 0) {
    return `${weeks} Weeks`;
  }
  if (Number(days) > 0) {
    return `${days} Days`;
  }
  if (Number(hours) > 0) {
    return `${hours} Hours`;
  }
  if (Number(minutes) > 0) {
    return `${minutes} Minutes`;
  }
  if (Number(seconds) > 0) {
    return `${seconds} Seconds`;
  }
  return '<1 min';
}
