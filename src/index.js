import express from 'express'
import cors from 'cors'
import {corsOptions, PORT, titleToValidName} from './config.js'
import {turso, initDatabase} from './db.js'

const app = express()
app.use(cors(corsOptions))
app.use(express.json())

try {
  await initDatabase()
  console.log('Database initialized successfully')
} catch (error) {
  console.error('Error initializing database:', error)
  process.exit(1)
}

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await turso.execute('SELECT * FROM posts')
    
    if (posts.rows.length === 0) {
      return res.status(404).json({
        error: 'No posts found',
        message: 'No se encontraron posts'
      })
    }
    
    const data = posts.rows.slice(0, 5)
    data.sort((a, b) => new Date(b.date) - new Date(a.date))
    data.forEach(post => {
      post.date = new Date(post.date).toISOString()
      post.tags = JSON.parse(post.tags)
    })
    
    res.json(data)
  
  } catch (error) {
    console.error('Error fetching posts: ', error)
    
    res.status(500).json({
      error: 'Error al cargar los posts',
      message: 'No se pudieron cargar los posts'
    })
  
  }
})

app.get('/api/posts/:slug', async (req, res) => {
  const {slug} = req.params
  
  try {
    const post = await turso.execute({
      sql: 'SELECT * FROM posts WHERE (slug = ?)',
      args: [slug]
    })
    
    if (post.rows.length === 0) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'El post solicitado no existe'
      })
    }

    post.rows[0].date = new Date(post.rows[0].date).toISOString()
    post.rows[0].tags = JSON.parse(post.rows[0].tags)

    res.json(post.rows[0])
  
  } catch (error) {
    console.error('Error searching post', error)
    
    res.status(404).json({
      error: 'Post not found',
      message: 'El post solicitado no existe'
    })
  
  }
})

app.post('/api/posts', async (req, res) => {
  const {title, date, tags, author, body} = req.body
  
  if (!(title && date && tags && author && body)) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Todos los campos son requeridos'
    })
  }
  
  const tagsJson = JSON.stringify(tags)
  const formattedDate = new Date(date).toISOString()
  const slug = titleToValidName(title)
  
  try {
    await turso.execute({
      sql: 'INSERT INTO posts (title, date, tags, author, slug, body) VALUES (?, ?, ?, ?, ?, ?)',
      args: [title, formattedDate, tagsJson, author, slug, body]
    })

    res.status(201).json({message: 'Post creado exitosamente'}) 
  
  } catch (error){
    console.error('Error creating post: ', error)
    
    res.status(500).json({
      error: 'Error creating post',
      message: 'No se pudo crear el post'
    })

  }
})

app.get('/', (req, res) => {
  res.json({message: 'Working fine (:'})
})

app.listen(PORT, (error) => {
  if (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})