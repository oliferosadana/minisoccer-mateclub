pipeline {
    agent any

    tools {
        // Nama tool NodeJS yang dikonfigurasi di Manage Jenkins -> Global Tool Configuration
        nodejs 'node-20'
    }

    environment {
        APP_NAME        = 'mateclub-minisoccer-web'
        DOCKER_IMAGE    = "mateclub-minisoccer:${BUILD_NUMBER}"
        DOCKER_LATEST   = "mateclub-minisoccer:latest"
        DEPLOY_PORT     = '8080'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '5'))
        timeout(time: 20, unit: 'MINUTES')
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'DEPLOY_ENV', 
            choices: ['production', 'staging', 'none'], 
            description: 'Target Environment untuk deployment otomatis'
        )
        booleanParam(
            name: 'RUN_DOCKER_BUILD', 
            defaultValue: true, 
            description: 'Build Docker Image setelah build bundle frontend sukses'
        )
    }

    stages {
        stage('🧹 Workspace Preparation') {
            steps {
                echo '=== Menyiapkan Workspace & Membersihkan Sisa Build Sebelumnya ==='
                cleanWs(deleteDirs: true, notFailBuild: true, patterns: [[pattern: 'node_modules/**', type: 'EXCLUDE']])
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                echo '=== Menginstal dependensi NPM menggunakan npm ci ==='
                sh 'npm ci'
            }
        }

        stage('🔍 Lint & Code Quality') {
            steps {
                echo '=== Menjalankan Linter Oxlint ==='
                sh 'npm run lint'
            }
        }

        stage('🏗️ Build Production Bundle') {
            steps {
                echo '=== Mengompilasi Asset Frontend Vite (Production) ==='
                sh 'npm run build'
            }
            post {
                success {
                    echo '=== Mengarsipkan Artefak dist/ ==='
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: false
                }
            }
        }

        stage('🐳 Build Docker Image') {
            when {
                expression { return params.RUN_DOCKER_BUILD == true }
            }
            steps {
                echo "=== Membangun Docker Image: ${env.DOCKER_IMAGE} ==="
                sh """
                    docker build -t ${env.DOCKER_IMAGE} -t ${env.DOCKER_LATEST} .
                """
            }
        }

        stage('🚀 Deploy Application') {
            when {
                anyOf {
                    expression { return params.DEPLOY_ENV == 'production' }
                    expression { return params.DEPLOY_ENV == 'staging' }
                }
            }
            steps {
                echo "=== Memulai Deployment ke Target: ${params.DEPLOY_ENV} ==="
                sh """
                    # Hentikan kontainer lama jika sedang berjalan
                    docker stop ${env.APP_NAME} || true
                    docker rm ${env.APP_NAME} || true

                    # Jalankan kontainer baru dengan restart policy
                    docker run -d \\
                        --name ${env.APP_NAME} \\
                        --restart unless-stopped \\
                        -p ${env.DEPLOY_PORT}:80 \\
                        ${env.DOCKER_IMAGE}
                """

                echo '=== Verifikasi Health Check Endpoint ==='
                sleep time: 5, unit: 'SECONDS'
                sh """
                    curl -s -f http://localhost:${env.DEPLOY_PORT} > /dev/null || {
                        echo "❌ Health check Gagal! Container tidak merespons HTTP 200."
                        exit 1
                    }
                    echo "✅ Health check Sukses! Aplikasi MATE CLUB aktif di port ${env.DEPLOY_PORT}."
                """
            }
        }
    }

    post {
        always {
            echo '=== Pipeline Execution Completed ==='
        }
        success {
            echo "🎉 Pipeline Jenkins Sukses! Build #${env.BUILD_NUMBER} berhasil diproses."
        }
        failure {
            echo "❌ Pipeline Jenkins Gagal pada Build #${env.BUILD_NUMBER}. Silakan periksa log console."
        }
    }
}
