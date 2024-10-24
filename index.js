const express = require('express')
const app = express()
require('dotenv').config() // this needs to be before importing Note

const Note = require('./models/note')

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
app.use(express.static('dist'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!!!!!!</h1>')
})

// app.get('/api/notes', (request, response) => {
//   response.json(notes)
// })

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
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

app.post('/api/notes', (request, response, next) => {
  const body = request.body
  if (!body.content || body.content === undefined) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false, // default false if not already given
  })

  note.save().then(result => {
    console.log('note saved!')
    response.json(result)
  })
  .catch(error => {next(error)})
})

// app.get('/api/notes/:id', (request, response) => {
//   const id = request.params.id
//   const note = notes.find(note => note.id === id)
//   if (note) {
//     response.json(note)
//   } else {
//     response.status(404).end()
//   }
// })

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  Note.findById(id).then(note => {
    response.json(note)
  })
})

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findByIdAndDelete(id)
    .then(result => response.status(204).end())
    .catch(error => { next(error) })
  // notes = notes.filter(note => note.id !== id)
  // keep the note whose id is not the deleted id

})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body
  // const note = {
  //   content: body.content,
  //   important: body.important,
  // }
  console.log(request.params.id, note)
  Note.findByIdAndUpdate(request.params.id, { content, important }, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    }).catch(error => { next(error) })
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

