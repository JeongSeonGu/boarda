/**
 * types/index.js
 * 앱 전체에서 사용하는 데이터 형태(JSDoc) 정의.
 * TypeScript 도입 시 이 파일을 .ts/.d.ts 로 교체하면 됩니다.
 *
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string[]} tags
 * @property {string} createdAt   - ISO date string
 *
 * @typedef {Object} Column
 * @property {string} id
 * @property {string} name
 * @property {string} color       - hex
 * @property {Post[]} posts
 *
 * @typedef {'보통'|'중요'|'매우중요'|'나중에'} LinkImportance
 *
 * @typedef {Object} LinkItem
 * @property {string} id
 * @property {string} title
 * @property {string} url
 * @property {string} desc
 * @property {string} category
 * @property {LinkImportance} importance
 * @property {string[]} tags
 * @property {string} emoji
 * @property {string} createdAt
 *
 * @typedef {'columns'|'links'} BoardType
 *
 * @typedef {Object} Board
 * @property {string}     id
 * @property {BoardType}  type
 * @property {string}     name
 * @property {string}     desc
 * @property {string}     color     - hex
 * @property {string}     createdAt - ISO date string
 * @property {Column[]}   [columns] - type === 'columns' 일 때
 * @property {LinkItem[]} [links]   - type === 'links'   일 때
 *
 * @typedef {'success'|'error'|'info'|'warning'} ToastType
 *
 * @typedef {Object} Toast
 * @property {string}    id
 * @property {string}    message
 * @property {ToastType} type
 */

export {};
