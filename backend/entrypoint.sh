#!/bin/sh
chown -R express:nodejs /app/database /app/submissions
exec gosu express "$@"
