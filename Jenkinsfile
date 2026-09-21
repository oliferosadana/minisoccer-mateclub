pipeline {
    agent any

    environment {
        APP_NAME      = 'mateclub-minisoccer-web'
        DOCKER_IMAGE  = "mateclub-minisoccer:${BUILD_NUMBER}"
        DOCKER_LATEST = "mateclub-minisoccer:latest"
        DEPLOY_PORT   = '8080'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    parameters {
        choice(
            name: 'DEPLOY_ENV', 
            choices: ['none', 'production', 'staging'], 
            description: 'Target Environment untuk deployment otomatis'
        )
        booleanParam(
            name: 'RUN_DOCKER_BUILD', 
            defaultValue: false, 
            description: 'Build Docker Image (Aktifkan jika Docker sudah terpasang di server Jenkins)'
        )
    }

    stages {
        stage('🔍 Check Environment') {
            steps {
                script {
                    echo '=== [Stage 1] Memeriksa Lingkungan Node.js & Git ==='
                    if (isUnix()) {
                        sh '''
                            echo "Operating System: $(uname -s)"
                            node -v || echo "⚠️ Node.js belum ada di PATH"
                            npm -v || echo "⚠️ NPM belum ada di PATH"
                        '''
                    } else {
                        bat '''
                            echo Operating System: Windows
                            node -v
                            npm -v
                        '''
                    }
                }
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                script {
                    echo '=== [Stage 2] Menginstal Dependensi Project ==='
                    if (isUnix()) {
                        sh 'npm ci || npm install'
                    } else {
                        bat 'npm ci || npm install'
                    }
                }
            }
        }

        stage('🔍 Code Quality & Linting') {
            steps {
                script {
                    echo '=== [Stage 3] Menjalankan Linter Oxlint ==='
                    if (isUnix()) {
                        sh 'npm run lint || true'
                    } else {
                        bat 'npm run lint || ver>nul'
                    }
                }
            }
        }

        stage('🏗️ Build Vite Production Bundle') {
            steps {
                script {
                    echo '=== [Stage 4] Mengompilasi Bundle Vite (dist/) ==='
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('🐳 Build Docker Image') {
            when {
                expression { return params.RUN_DOCKER_BUILD == true }
            }
            steps {
                script {
                    echo "=== [Stage 5] Membangun Docker Image: ${env.DOCKER_IMAGE} ==="
                    if (isUnix()) {
                        sh """
                            docker build -t ${env.DOCKER_IMAGE} -t ${env.DOCKER_LATEST} .
                        """
                    } else {
                        bat """
                            docker build -t ${env.DOCKER_IMAGE} -t ${env.DOCKER_LATEST} .
                        """
                    }
                }
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
                script {
                    echo "=== [Stage 6] Menjalankan Deployment ke ${params.DEPLOY_ENV} ==="
                    if (isUnix()) {
                        sh """
                            docker stop ${env.APP_NAME} || true
                            docker rm ${env.APP_NAME} || true
                            docker run -d --name ${env.APP_NAME} --restart unless-stopped -p ${env.DEPLOY_PORT}:80 ${env.DOCKER_IMAGE}
                            sleep 3
                            curl -s -f http://localhost:${env.DEPLOY_PORT} > /dev/null && echo "✅ Aplikasi Berhasil Online di Port ${env.DEPLOY_PORT}" || echo "⚠️ Warning: Endpoint belum merespon"
                        """
                    } else {
                        bat """
                            docker stop ${env.APP_NAME} || ver>nul
                            docker rm ${env.APP_NAME} || ver>nul
                            docker run -d --name ${env.APP_NAME} --restart unless-stopped -p ${env.DEPLOY_PORT}:80 ${env.DOCKER_IMAGE}
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo "=== Selesai mengeksekusi Pipeline Jenkins Build #${env.BUILD_NUMBER} ==="
        }
        success {
            echo "🎉 Build #${env.BUILD_NUMBER} BERHASIL LULUS SEMUA TAHAPAN!"
        }
        failure {
            echo "❌ Build #${env.BUILD_NUMBER} GAGAL. Silakan periksa pesan error di Console Output Jenkins."
        }
    }
}
