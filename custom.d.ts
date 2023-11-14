declare module "*.svg" {
  const name: string
  export = name
}

declare module "*.png" {
  const value: any
  export default value
}

declare module "*.jpg" {
  const value: any
  export default value
}

declare module "*.ico" {
  const value: any
  export default value
}

declare module "*.m.css" {
  const classes: { [key: string]: string }
  export default classes
}

declare module "*.m.scss" {
  const classes: { [key: string]: string }
  export default classes
}

declare module "*.ttf" {
  const value: any
  export default value
}

declare module "*.pdf" {
  const value: any
  export default value
}

declare module "*.mp3" {
  const name: string
  export = name
}

declare module "*.wav" {
  const name: string
  export = name
}
