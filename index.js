import fs from 'node:fs/promises'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const PORT = process.env.PORT || 3000
const DOMAIN = process.env.DOMAIN

const titleToValidName = (title) => {
  return title
    .toLowerCase()
    .replace(/[áäâà]/g, 'a') 
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const app = express()

app.use(cors({
  origin: ['http://localhost:4321', DOMAIN],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json())

const fileDir = (name) => path.join(process.cwd(), 'src', 'content', 'posts', name)

app.get('/', (req, res) => {
  res.json({message: 'Working fine (:'})
})

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: 'Error al crear el post'
  })
}

app.post('/api/blog', async (req, res) => {
  const {title, date, description, body} = req.body
  
  if (!(title && date && description && body)) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Todos los campos son requeridos'
    })
  }
  
  const fileName = `${titleToValidName(title)}.md`
  const filePath = fileDir(fileName)
  
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const data = `---
title: "${title}"
date: "${date}"
description: "${description}"
---
${body}`

  await fs.writeFile(filePath, data)
  res.json({message: 'Post creado exitosamente'})
})

app.use(errorHandler)

app.listen(3000, (error) => {
  if (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
  console.log('Servidor corriendo en http://localhost:3000')
})