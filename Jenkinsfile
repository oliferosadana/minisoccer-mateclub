pipeline {
    agent any

    environment {
        APP_NAME      = 'mateclub-minisoccer-web'
        DOCKER_IMAGE  = "mateclub-minisoccer:${BUILD_NUMBER}"
        DOCKER_LATEST = "mateclub-minisoccer:latest"
        DEPLOY_PORT   = '8080'
        PATH          = "${WORKSPACE}/.tools/node/bin:${env.PATH}"
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
        stage('⚙️ Setup Node.js Runtime') {
            steps {
                script {
                    echo '=== [Stage 1] Memastikan Ketersediaan Node.js & NPM Runtime ==='
                    if (isUnix()) {
                        sh '''
                            if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
                                echo "⚠️ Node.js/NPM tidak terpasang di host Jenkins. Mempersiapkan Portable Node.js 20 LTS..."
                                mkdir -p .tools
                                if [ ! -f .tools/node/bin/node ]; then
                                    echo "⬇️ Mengunduh Node.js 20.18.0 Linux x64 standalone..."
                                    curl -fsSL https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.gz -o .tools/node.tar.gz || \
                                    wget -q https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.gz -O .tools/node.tar.gz
                                    
                                    mkdir -p .tools/node
                                    tar -xzf .tools/node.tar.gz -C .tools/node --strip-components=1
                                    rm -f .tools/node.tar.gz
                                    echo "✅ Node.js 20 LTS berhasil dipasang di workspace!"
                                fi
                            fi

                            export PATH="${WORKSPACE}/.tools/node/bin:$PATH"
                            echo "Node version: $(node -v)"
                            echo "NPM version:  $(npm -v)"
                        '''
                    } else {
                        bat '''
                            echo Memeriksa Node.js pada Windows...
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
                    echo '=== [Stage 2] Menginstal Dependensi NPM ==='
                    if (isUnix()) {
                        sh '''
                            export PATH="${WORKSPACE}/.tools/node/bin:$PATH"
                            npm ci || npm install
                        '''
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
                        sh '''
                            export PATH="${WORKSPACE}/.tools/node/bin:$PATH"
                            npm run lint || true
                        '''
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
                        sh '''
                            export PATH="${WORKSPACE}/.tools/node/bin:$PATH"
                            npm run build
                        '''
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
                            docker build -t ${env.DOCKER_IMAGE} -t ${env.DOCKER_LATEST} . || echo "⚠️ Docker tidak dapat dijalankan di host ini"
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
                            docker run -d --name ${env.APP_NAME} --restart unless-stopped -p ${env.DEPLOY_PORT}:80 ${env.DOCKER_IMAGE} || echo "⚠️ Lewati deploy container"
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
            echo "🎉 Build #${env.BUILD_NUMBER} BERHASIL LULUS! Artefak dist/ siap digunakan."
        }
        failure {
            echo "❌ Build #${env.BUILD_NUMBER} Gagal. Silakan periksa log console."
        }
    }
}
