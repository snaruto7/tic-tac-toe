#!groovy

def COLOR_MAP = ['SUCCESS': '#008000', 'FAILURE': '#ff1744', 'UNSTABLE': '#ffc300', 'ABORTED': '#bebebe']
def getBuildUser() {
    if(currentBuild.rawBuild.getCause(Cause.UserIdCause)!=null)
        return currentBuild.rawBuild.getCause(Cause.UserIdCause).getUserId()
    else
        return null
}

pipeline {
    agent { label 'master'}
    environment{
        version = VersionNumber([versionNumberString: '${BUILD_YEAR}.${BUILD_MONTH}.${BUILD_DAY}.TIC-TAC-TOE.${BUILDS_ALL_TIME}', projectStartDate: '2020-04-01'])
        codeRepo = "https://github.com/snaruto7/tic-tac-toe.git"
        branch = "master"
        imageName = "tic-tac-toe"
        registry = "kubepractice.azurecr.io"
        registrySecret = "docker-secret"
    }
    stages{
        stage('Git Checkout'){
            steps {
                checkout([$class: 'GitSCM', branches: [[name: "*/${branch}"]], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'github-creds', url: "${codeRepo}"]]])
            }
        }

        stage('Docker build'){
            steps{
                sh '''
                    docker build -f ./docker/Dockerfile -t $imageName:$VER .
                '''
            }
        }

        stage('Docker Push'){
            steps{
                withCredentials([azureServicePrincipal("shivam-subs")]){
                    sh '''
                        docker login $registry -u $AZURE_CLIENT_ID --password $AZURE_CLIENT_SECRET

                        docker tag $imageName:$version $registry/$imageName:$version
                        docker push $registry/$imageName:$version
                        docker rmi -f $registry/$imageName:$version
                    '''
            }
        }
        stage('Get Kubernetes Details'){
            environment{
                VAULT_ADDR = "http://40.65.202.70:8200"
            }
            steps{
                withCredentials([string(credentialsId: "VAULT_ROLE_ID", variable: "ROLE_ID"), string(credentialsId: "VAULT_SEC_ID", variable: "SEC_ID")]) {
                    sh '''
                        set +x
                        export VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id=${ROLE_ID} secret_id=${SEC_ID})
                        vault kv get -field=kube-config secret/Aks-Deployment > kube-config
                    '''
                }
            }
        }
        stage('Create Registry Secret'){
            steps{
                withCredentials([azureServicePrincipal("shivam-subs")]){
                    sh """
                        if kubectl --kubeconfig=${WORKSPACE}/kube-config describe secret ${registrySecret}
                        then
                        kubectl --kubeconfig=${WORKSPACE}/kube-config delete secret ${registrySecret}
                        fi
                        kubectl --kubeconfig=${WORKSPACE}/kube-config create secret docker-registry ${registrySecret} --docker-server=$registry --docker-username=$AZURE_CLIENT_ID --docker-password=$AZURE_CLIENT_SECRET --docker-email=shivam.narula7@gmail.com
                    """
            }
        }
        stage('Deploy Application'){
            steps{
                sh """
                    sed -ie 's/#{REGISTRY_URL}#\\/#{IMAGE_NAME}#:#{BUILD_ID}#/$registry\\/$imageName:$version' kubernetes/deployment.yaml

                    kubectl --kubeconfig=${WORKSPACE}/kube-config apply -f  kubernetes/deployment.yaml

                    kubectl --kubeconfig=${WORKSPACE}/kube-config apply -f kubenetes/service.yaml

                    kubectl --kubeconfig=${WORKSPACE}/kube-config rollout restart deployment/tic-tac-toe

                    kubectl --kubeconfig=${WORKSPACE}/kube-config rollout status deployment/tic-tac-toe
                """
            }
        }
    }
    post{
        always{
            script {
                BUILD_USER = getBuildUser()
            }
            slackSend channel: '#apps', 
            color: COLOR_MAP[currentBuild.currentResult],
            message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER} by ${BUILD_USER}\n More info at: ${env.BUILD_URL}" 
            
            cleanWs()
        }
    }
}