export type UserData = {
  name: {
    first: string
    last: string
  }
  email: string
}

export type PlantData = {
  plant_name:string, sent_from:string, date:Date
}

export type TaskData = {
  name:string, time:Number, priority:Number, finished:boolean
}