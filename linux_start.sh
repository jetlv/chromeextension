#!/bin/bash - 
#===============================================================================
#
#          FILE: linux_start.sh
# 
#         USAGE: ./linux_start.sh 
# 
#   DESCRIPTION: 
# 
#       OPTIONS: ---
#  REQUIREMENTS: ---
#          BUGS: ---
#         NOTES: ---
#        AUTHOR: YOUR NAME (), 
#  ORGANIZATION: 
#       CREATED: 02/28/2017 01:46
#      REVISION:  ---
#===============================================================================

set -o nounset                              # Treat unset variables as an error
node server.js

