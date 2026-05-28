export enum ContentType {
  json = 'application/json',
  formData = 'multipart/form-data',
  formUrlEncoded = 'application/x-www-form-urlencoded',
  text = 'text/plain',
  html = 'text/html',
  octetStream = 'application/octet-stream',
}

export type ContentTypeInput = ContentType | (string & {});
