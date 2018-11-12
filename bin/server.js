#!/usr/bin/env node

'use strict'

const express = require('express')
const createRoutes = require('../src/routes')

module.exports = () => createRoutes(express(), express)
