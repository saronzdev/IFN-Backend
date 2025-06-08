import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const PORT = process.env.PORT || 3000
const DOMAIN = process.env.DOMAIN

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

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

app.use((req, res, next) => {
  if (!fsSync.existsSync(POSTS_DIR)) fs.mkdir(POSTS_DIR, { recursive: true })
  next()
})

const allowedOrigins = ['http://localhost:4321', DOMAIN]

const corsOptions = {
  origin: (origin, callback) => {
    console.log(origin)
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('El origen no está permitido'));
    },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())

const fileDir = (name) => path.join(process.cwd(), 'content', 'posts', name)

app.get('/', (req, res) => {
  res.json({message: 'Working fine (:'})
})

app.get('/api/posts', async (req, res) => {
  const files = await fs.readdir(POSTS_DIR)
  if (!files.length) {
    return res.status(404).json({
      error: 'No posts found',
      message: 'No se encontraron posts'
    })
  }

  try {
    const posts = Promise.all(files.map(async file => {
      const filePath = path.join(POSTS_DIR, file)
      const postContent = await fs.readFile(filePath, 'utf-8')
      return {
        slug: file.slice(0, -3),
        content: postContent
      }
    }))
    res.json(await posts)
  } catch (error) {
    res.status(500).json({
      error: 'Error al leer los posts',
      message: 'No se pudieron cargar los posts'
    })
  }
})

app.get('/api/posts/:fileName', async (req, res) => {
  const {fileName} = req.params
  const filePath = fileDir(`${fileName}.md`)

  try {
    const postContent = await fs.readFile(filePath, 'utf-8')
    res.json({content: postContent})
  } catch (error) {
    console.error('Error al leer el archivo:', error)
    res.status(404).json({
      error: 'Post not found',
      message: 'El post solicitado no existe'
    })
  }
})

app.post('/api/posts', async (req, res) => {
  const {title, date, description, body} = req.body
  
  if (!(title && date && description && body)) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Todos los campos son requeridos'
    })
  }
  
  const fileName = `${titleToValidName(title)}.md`
  const filePath = fileDir(fileName)

  const data = `---
title: "${title}"
date: "${date}"
description: "${description}"
---
${body}`

  await fs.writeFile(filePath, data)
  res.json({message: 'Post creado exitosamente'})
})

app.listen(PORT, (error) => {
  if (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
  console.log('Servidor corriendo en http://localhost:3000')
})
