import { Router, Request, Response } from 'express'
import multer from 'multer'
import { Readable } from 'stream'
import readline from 'readline'

const multerConfig = multer()

const router = Router()

const xl = require('excel4node')

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

  for await (let line of productsLine) {
    boletimLineSplit = line.split(',')
    //console.log(boletimLineSplit[1])

    const name = boletimLineSplit[0].replace(/"/g, '')
    const lastName = boletimLineSplit[1].replace(/"/g, '')

    function listaNotas() {
      let nota = []
      let pontos = 4
      for (let i = 1; i <= atividades; i++) {
        nota.push(parseInt(boletimLineSplit[pontos].replace(/"/g, '')))

        pontos = pontos + 3
      }
      return nota
    }

    boletim.push({
      name: `${name} ${lastName}`,
      nota: listaNotas(),
      media: 0
    })

    // for (let aluno = 0; aluno <= boletim.length; aluno++) {
    //   let media = 0;

    //   for (let i = 0; i <= atividades; i++) {
    //     media += boletim[aluno].nota[i];
    //   }
    //   boletim[aluno].media = media
    // }

  }

  const headerBoletim = boletim.shift()

  //FAZER A PLANILHA EM EXCEL

  const wb = new xl.Workbook()
  const ws = wb.addWorksheet('Nome da planilha')

  const headingColumnNames = [
    "NOME",
  ]

  for (let i = 1; i <= atividades; i++) {
    headingColumnNames.push(`NOTA${i}`)
  }

  headingColumnNames.push("MÉDIA")

  const styleHeader = {
    fill: {
      type: 'pattern',
      patternType: 'solid',
      fgColor: '#D3D3D3',
    },
    font: {
      bold: true,
    }
  }

  let headingColumnIndex = 1
  headingColumnNames.forEach(heading => {
    ws.cell(1, headingColumnIndex++).string(heading).style(styleHeader)
  });

  let rowIndex = 2
  boletim.forEach(record => {
    Object.keys(record).forEach(() => {
      ws.cell(rowIndex, 1).string(record['name'])
    })
    rowIndex++
  })
  let aluno = 0
  for (let row = 2; row <= boletim.length + 1; row++) {
    let column = 2
    let media = 0
    for (let columnNota = 0; columnNota < atividades; columnNota++) {
      ws.cell(row, column++).number(boletim[aluno].nota[columnNota])

      media += boletim[aluno].nota[columnNota]
    }

    let styleMedia = {
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: '#000000'
      },
      font: {
        color: '#FFFFFF',
      }
    }

    ws.cell(row, column).number(Math.round(media / atividades))
    aluno++
  }

  wb.write('saves/boletim.xlsx')

  return response.send(boletim);
})

export { router }