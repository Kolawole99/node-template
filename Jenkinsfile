#!/usr/bin/env groovy

pipeline {
    // Can run on any Jenkins server
    agent any

    stages {
        // For importing scripts
        stage("init"){
            steps{
                echo "Initialized"
            }
        }

        stage("build"){
            when {
                expression {
                    BRANCH_NAME == 'dev'
                }
            }
            steps{
                echo 'Building app...'
            }
        }

        stage("test"){
            when {
                expression {
                    BRANCH_NAME == 'dev' || BRANCH_NAME == 'master'
                }
            }
            steps{
                echo "Testing..."
            }
        }

        stage("deploy"){
            steps{
                echo "Deploying version app"
            }
        }
    }
}
