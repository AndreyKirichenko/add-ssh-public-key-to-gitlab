# Passing SSH publick key into gitlab account settings
## Wherefore:
This script is usefull for quick passing of public ssh key from your server terminal to gitlab account
## Using:
git clone git@github.com:AndreyKirichenko/add-ssh-public-key-to-gitlab.git

cd add-ssh-public-key-to-gitlab

yarn && yarn start
### Also you can pass login and password using params:
yarn && yarn start --u someGitlabUserName --p someGitlabPassword
## Attention:
This script can be broken if gitlab team changes markup. 

Write me andrey.kirichenko999@gmail.com
