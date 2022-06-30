import { Router, Request, Response } from 'express'
import multer from 'multer'
import { Readable } from 'stream'
import readline from 'readline'

const multerConfig = multer()

const router = Router()

router.post('/fileExcel', multerConfig.single("file"), async (request: Request, response: Response) => {

  const buffer = request.file?.buffer
  const { atividades } = request.body

 const readableFile = new Readable()
 readableFile.push(buffer)
 readableFile.push(null)

 const productsLine = readline.createInterface({
  input: readableFile
 })

 let boletimLineSplit: string[]
 const boletim = []

 for await(let line of productsLine) {
  boletimLineSplit = line.split(',')
  console.log(boletimLineSplit[1])

  const name = boletimLineSplit[0].replace(/"/g, '')
  const lastName = boletimLineSplit[1].replace(/"/g, '')

  function listaNotas() {
   let nota = []
   let pontos = 4
    for(let i = 1; i <= atividades; i++) {
     nota.push(parseInt(boletimLineSplit[pontos].replace(/"/g, '')))

     pontos = pontos + 3
    }
    return nota
  }

  boletim.push({
   name: `${name} ${lastName}`,
   nota: listaNotas()
  })

 }

 const headerBoletim = boletim.shift()


 return response.send(boletim);
})

export { router }