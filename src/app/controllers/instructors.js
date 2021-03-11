const Instructor = require('../models/Instructor')
const { age, date } = require('../../lib/utils')
const db = require('../../config/db')

module.exports = {
  index(req, res) {

    let { filter, page, limit } = req.query

    page = page || 1
    limit = limit || 2
    let offset = limit * (page - 1)

    const params = {
      filter,
      page,
      limit,
      offset,
      callback(instructors) {

        const pagination = {
          total: Math.ceil(instructors[0].total / limit),
          page
        }
        return res.render('instructors/index', { instructors, pagination, filter })
      }
    }

    Instructor.paginate(params)


  },

  create(req, res) {
    return res.render('instructors/create')
  },
  post(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "") {
        return res.send('Please, fill all fields!')
      }
    }
    const query = `INSERT INTO instructors(
      name,
      avatar_url,
      gender,
      services,
      birth,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id`

    const values = [
      req.body.name,
      req.body.avatar_url,
      req.body.gender,
      req.body.services,
      date(req.body.birth).iso,
      date(Date.now()).iso
    ]

    db.query(query, values, function (err, results) {
      if (err) return res.send('Database error!')

      return res.redirect(`/instructors/${results.rows[0].id}`)
    })

  },

  show(req, res) {
    Instructor.find(req.params.id, function (instructor) {
      if (!instructor) return res.send('Instructor nof found!')

      instructor.age = age(instructor.birth)
      instructor.services = instructor.services.split(',')
      instructor.created_at = date(instructor.created_at).format

      return res.render("instructors/show", { instructor })

    })
  },

  edit(req, res) {
    Instructor.find(req.params.id, function (instructor) {
      if (!instructor) return res.send('Instructor nof found!')

      instructor.birth = date(instructor.birth).iso

      return res.render("instructors/edit", { instructor })

    })
  },

  put(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "") {
        return res.send('Please, fill all fields!')
      }
    }

    Instructor.update(req.body, function () {
      return res.redirect(`/instructors/${req.body.id}`)
    })

  },

  delete(req, res) {
    Instructor.delete(req.body.id, function () {
      return res.redirect(`/instructors`)
    })
  },
}
