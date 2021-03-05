import REST_API_URL from './default_API_URL';

export function getUserImage(filename) {
  return `${REST_API_URL}user/image/${filename}`;
}

export function getForumImage(filename) {
  return `${REST_API_URL}forum/image/${filename}`;
}

export const defaultImage = 'default.png';