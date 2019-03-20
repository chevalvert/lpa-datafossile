#!/bin/bash

NODE_VERSION=8
REPO="lpa-datafossile"
REMOTE="https://github.com/chevalvert/$REPO.git"
DEST="$PWD/$REPO"

# test if command exists
ftest () {
  echo "Checking for ${1}..."
  if ! type -f "${1}" > /dev/null 2>&1; then
    return 1
  else
    return 0
  fi
}

# Use colors, but only if connected to a terminal, and that terminal
# supports them.
if which tput >/dev/null 2>&1; then
  ncolors=$(tput colors)
fi
if [ -t 1 ] && [ -n "$ncolors" ] && [ "$ncolors" -ge 8 ]; then
  RED="$(tput setaf 1)"
  GREEN="$(tput setaf 2)"
  YELLOW="$(tput setaf 3)"
  BLUE="$(tput setaf 4)"
  BOLD="$(tput bold)"
  NORMAL="$(tput sgr0)"
else
  RED=""
  GREEN=""
  YELLOW=""
  BLUE=""
  BOLD=""
  NORMAL=""
fi

# feature tests
features () {
  for f in "${@}"; do
    ftest "${f}" || {
      echo >&2 "${RED}error: Missing \`${f}'! Make sure it exists and try again.${NORMAL}"
      return 1
    }
  done
  return 0
}

# SEE https://gist.github.com/davejamesmiller/1965569
ask () {
  local prompt default reply

  if [ "${2:-}" = "Y" ]; then
    prompt="Y/n"
    default=Y
  elif [ "${2:-}" = "N" ]; then
    prompt="y/N"
    default=N
  else
    prompt="y/n"
    default=
  fi

  while true; do
    # Ask the question (not using "read -p" as it uses stderr not stdout)
    echo -n "$1 [$prompt] "

    # Read the answer (use /dev/tty in case stdin is redirected from somewhere else)
    read reply </dev/tty

    # Default?
    if [ -z "$reply" ]; then
      reply=$default
    fi

    # Check if the reply is valid
    case "$reply" in
      Y*|y*) return 0 ;;
      N*|n*) return 1 ;;
    esac
  done
}

# main setup
setup () {
  echo
  echo "${BLUE}This will install ${BOLD}$REPO${NORMAL}${BLUE} and all its dependencies${NORMAL}"
  ask "Do you wish to continue ?" || return 1

  echo
  echo "${BLUE}Running $REPO installation...${NORMAL}"
  echo

  # Fail if destination exists
  test -d "${DEST}" && {
    echo >&2 "${YELLOW}warning: Already exists: ${BOLD}$DEST${NORMAL}"
    ask "Overwrite $DEST ?" || return 1
    rm -rf $DEST
    echo
  }

  # test for require features
  features git node npm || return $?

  # installation and build
  {
    echo
    echo "Cloning $REPO..."
    git clone --depth=1 "${REMOTE}" "${DEST}" || return $?

    echo
    echo "Installing $REPO..."
    (cd $DEST && npm install --production)

    echo
    echo "${GREEN}${BOLD}$REPO ${NORMAL}${GREEN}successfully installed in ${BOLD}$DEST${NORMAL}"
    echo "${BLUE}Visit ${BOLD}${REMOTE/.git/#readme}${NORMAL}${BLUE} to read documentation${NORMAL}"
  } >&2
  return $?
}

[ $# -eq 0 ] && setup
exit $?
