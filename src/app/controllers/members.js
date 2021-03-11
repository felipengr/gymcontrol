const { date } = require('../../lib/utils')
const Member = require('../models/Member')
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
      callback(members) {

        const pagination = {
          total: Math.ceil(members[0].total / limit),
          page
        }
        return res.render('members/index', { members, pagination, filter })
      }
    }

    Member.paginate(params)
  },

  create(req, res) {

    Member.instructorsSelectOptions(function (options) {
      return res.render('members/create', { instructorOptions: options })
    })

  },
  post(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "") {
        return res.send('Please, fill all fields!')
      }
    }
    const query = `INSERT INTO members(
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

      return res.redirect(`/members/${results.rows[0].id}`)
    })

  },

  show(req, res) {
    Member.find(req.params.id, function (member) {
      if (!member) return res.send('Member nof found!')

      member.birth = date(member.birth).birthDay

      return res.render("members/show", { member })

    })
  },

  edit(req, res) {
    Member.find(req.params.id, function (member) {
      if (!member) return res.send('Member nof found!')

      member.birth = date(member.birth).iso

      Member.instructorsSelectOptions(function (options) {
        return res.render('members/edit', { member, instructorOptions: options })
      })

    })
  },

  put(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "") {
        return res.send('Please, fill all fields!')
      }
    }

    Member.update(req.body, function () {
      return res.redirect(`/members/${req.body.id}`)
    })

  },

  delete(req, res) {
    Member.delete(req.body.id, function () {
      return res.redirect(`/members`)
    })
  },
}
