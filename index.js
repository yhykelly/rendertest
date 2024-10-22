const express = require('express')
const app = express()

let notes = [
    {
      id: "1",
      content: "HTML is easy",
      important: true
    },
    {
      id: "2",
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: "3",
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

const cors = require('cors')
app.use(cors())

app.use(express.json()) // help to access the post data more easily
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!!!!!!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

const generateId = () => {
  console.log(notes.length)
  const maxId = notes.length > 0
  // ? notes.length
  ? Math.max(...notes.map(note => Number(note.id)))
  // use this because if some notes are deleted,
  // length is not a reliable source
  : 0
return String(maxId + 1)
}

app.post('/api/notes', (request, response) => {
  const body = request.body
  if (!body.content){
      return response.status(400).json({ 
          error: 'content missing' 
        })
  }

  const note = {
      content: body.content,
      important: Boolean(body.important) || false, // default false if not already given
      id: generateId(),
  }

  notes = notes.concat(note)
  response.json(note)
})

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id
    const note = notes.find(note => note.id === id)
    if (note){
    response.json(note)
    } else{
        response.status(404).end()
    }
  })

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id) 
    // keep the note whose id is not the deleted id
    response.status(204).end()
  })

app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

