pipeline {
    agent { label 'QA' }
    
    parameters {
        choice(name: 'TEST_SUITE', choices: ['all', 'web', 'mobile', 'smoke', 'regression'], description: 'Select test suite to run')
        booleanParam(name: 'DEBUG_MODE', defaultValue: false, description: 'Run tests in debug mode')
        booleanParam(name: 'UI_MODE', defaultValue: false, description: 'Run tests in Playwright UI mode')
    }
    
    environment {
        NODE_OPTIONS = '--max-old-space-size=4096'
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.playwright"
        CI = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                sh '''
                    echo "Setting up Playwright evaluation environment..."
                    node --version
                    npm --version
                    
                    # Install dependencies
                    npm install --no-audit --no-fund
                    
                    # Install Playwright browsers
                    npx playwright install chromium
                    
                    # Create test results directory
                    mkdir -p test-results || true
                    
                    # Verify setup
                    if [ ! -f package.json ]; then
                        echo "ERROR: package.json not found"
                        exit 1
                    fi
                    
                    echo "Setup completed successfully"
                '''
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    def scriptToRun = "npm run test"
                    
                    // Determine test suite
                    switch(params.TEST_SUITE) {
                        case 'web':
                            scriptToRun = "npm run test:web"
                            break
                        case 'mobile':
                            scriptToRun = "npm run test:mobile"
                            break
                        case 'smoke':
                            scriptToRun = "npm run test:smoke"
                            break
                        case 'regression':
                            scriptToRun = "npm run test:regression"
                            break
                        case 'all':
                        default:
                            scriptToRun = "npm run test"
                            break
                    }
                    
                    // Add mode flags
                    if (params.HEADED_MODE) {
                        scriptToRun = scriptToRun.replace('test:', 'test:headed:').replace('test ', 'test:headed ')
                    }
                    if (params.DEBUG_MODE) {
                        scriptToRun = scriptToRun.replace('test:', 'test:debug:').replace('test ', 'test:debug ')
                    }
                    if (params.UI_MODE) {
                        scriptToRun = scriptToRun.replace('test:', 'test:ui:').replace('test ', 'test:ui ')
                    }
                    
                    echo "Executing: ${scriptToRun}"
                    sh scriptToRun
                }
            }
        }
    }
    
    post {
        always {
            // Publish HTML report
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report'
            ])
            
            // Archive test results
            script {
                try {
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                } catch (Exception e) {
                    echo "Warning: Could not archive some artifacts: ${e.getMessage()}"
                }
            }
            
            // Clean workspace
            script {
                try {
                    cleanWs()
                } catch (Exception e) {
                    echo "Warning: Could not clean workspace: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            sh '''
                echo "=== Build failed - diagnostic information ==="
                echo "Node version: $(node --version)"
                echo "NPM version: $(npm --version)"
                echo "Playwright version: $(npx playwright --version)"
                echo "System info: $(uname -a)"
                echo "Memory info: $(free -h)"
                echo "Disk space: $(df -h)"
                echo "Test results directory contents:"
                ls -la test-results/ || echo "No test-results directory"
                echo "Playwright report directory contents:"
                ls -la playwright-report/ || echo "No playwright-report directory"
            '''
        }
        
        success {
            echo "✅ Build completed successfully!"
        }
    }
}
