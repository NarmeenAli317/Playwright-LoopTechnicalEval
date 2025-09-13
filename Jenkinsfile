pipeline {
    agent { label 'QA' }
    
    parameters {
        choice(
            name: 'TEST_ENVIRONMENT',
            choices: ['DEMO', 'UAT', 'PROD'],
            description: 'Select the test environment'
        )
        choice(
            name: 'NPM_SCRIPT',
            choices: [
                'test',
                'test:web',
                'test:mobile',
                'test:login',
                'test:security',
                'test:performance',
                'test:smoke',
                'test:regression',
                'test:release',
                'test:ui',
                'test:feature',
                'test:bug',
                'test:design',
                'test:high-priority'
            ],
            description: 'Select the npm script to run'
        )
        string(
            name: 'CUSTOM_SCRIPT',
            defaultValue: '',
            description: 'Custom npm script name (if not in the list above)'
        )
    }
    
    environment {
        NODE_OPTIONS = '--max-old-space-size=4096'
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.playwright"
        ENV = "${params.TEST_ENVIRONMENT}"
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
                    echo "Environment: ${ENV}"
                    node --version
                    npm --version
                    
                    # Install dependencies
                    npm install --no-audit --no-fund
                    
                    # Install Playwright browsers
                    npx playwright install chromium
                    
                    # Create test results directory
                    mkdir -p test-results || true
                    mkdir -p playwright-report || true
                    
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
                    def scriptToRun = ''
                    
                    if (params.CUSTOM_SCRIPT?.trim()) {
                        scriptToRun = params.CUSTOM_SCRIPT.trim()
                        echo "Using custom script: ${scriptToRun}"
                    } else if (params.NPM_SCRIPT) {
                        scriptToRun = params.NPM_SCRIPT
                        echo "Using selected npm script: ${scriptToRun}"
                    } else {
                        error "Please select or provide an npm script to run"
                    }
                    
                    // Validate script exists before running
                    def packageJson = readJSON file: 'package.json'
                    if (!packageJson.scripts.containsKey(scriptToRun)) {
                        error "Script '${scriptToRun}' not found in package.json. Available scripts: ${packageJson.scripts.keySet().join(', ')}"
                    }
                    
                    echo "Executing: npm run ${scriptToRun} with ENV=${env.ENV}"
                    
                    // Run the test with concise output
                    sh "npm run ${scriptToRun} -- --reporter=line"
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
            echo "Test results and artifacts have been archived"
        }
    }
}