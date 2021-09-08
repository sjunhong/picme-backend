import * as cdk from '@aws-cdk/core'
import * as ecs from '@aws-cdk/aws-ecs'
import { Secret } from '@aws-cdk/aws-secretsmanager'

export interface S3Credentials {
  S3_BUCKET_NAME: string
  ACCESS_KEY_ID: ecs.Secret
  SECRET_ACCESS_KEY: ecs.Secret
}

export interface AppCredentials {
  PORT: string
  JWT_SECRET: ecs.Secret
}

interface PickmeCredentials {
  appCredentials: AppCredentials
  s3Credentials: S3Credentials
}

export class CredentialsStack extends cdk.Stack {
  readonly pickmeCredentials: PickmeCredentials

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // import App Credentials
    const appPort = Secret.fromSecretPartialArn(
      this,
      '/picme/app/port',
      'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/app'
    )
      .secretValueFromJson('port')
      .toString()

    const appJwtSecret = ecs.Secret.fromSecretsManager(
      Secret.fromSecretPartialArn(
        this,
        '/picme/app/jwt_secret',
        'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/app'
        // 'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/app:jwt_secret::'
      ),
      'jwt_secret'
    )

    const appCredentials: AppCredentials = {
      PORT: appPort,
      JWT_SECRET: appJwtSecret,
    }

    // import S3 Credentials
    const s3BucketName = Secret.fromSecretPartialArn(
      this,
      '/picme/s3/bucket_name',
      'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/s3'
    )
      .secretValueFromJson('bucket_name')
      .toString()

    const s3AccessKeyId = ecs.Secret.fromSecretsManager(
      Secret.fromSecretPartialArn(
        this,
        '/picme/s3/access_key_id',
        'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/s3'
        // 'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/s3:access_key_id::'
      ),
      'access_key_id'
    )

    const s3SecretAccessKey = ecs.Secret.fromSecretsManager(
      Secret.fromSecretPartialArn(
        this,
        '/picme/s3/secret_access_key',
        'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/s3'
        // 'arn:aws:secretsmanager:ap-northeast-2:369590600858:secret:/pickme/s3:secret_access_key::'
      ),
      'secret_access_key'
    )

    const s3Credentials: S3Credentials = {
      S3_BUCKET_NAME: s3BucketName,
      ACCESS_KEY_ID: s3AccessKeyId,
      SECRET_ACCESS_KEY: s3SecretAccessKey,
    }

    this.pickmeCredentials = {
      appCredentials: appCredentials,
      s3Credentials: s3Credentials,
    }

    new cdk.CfnOutput(this, 'appJwtSecret', {
      value: appJwtSecret.arn,
      exportName: 'appJwtSecret',
    })

    new cdk.CfnOutput(this, 's3AccessKeyId', {
      value: s3AccessKeyId.arn,
      exportName: 's3AccessKeyId',
    })

    new cdk.CfnOutput(this, 's3SecretAccessKey', {
      value: s3SecretAccessKey.arn,
      exportName: 's3SecretAccessKey',
    })
  }
}
