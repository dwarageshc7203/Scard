#!/bin/bash
curl -v -X PATCH http://localhost:8080/api/profile \
-H "Content-Type: application/json" \
-d '{"designation":"Software Engineer","profileURL":"https://example.com","userName":"Dwaragesh C","bannerId":1,"socials":["github:https://github.com/dwarageshc7203"],"projects":[{"name":"","description":"","url":""}]}'
