import * as Path from 'path'
import * as FileSystem from 'fs'
import * as Https from 'https'

export default class ExporterUtils {

    public static getExportDirectory(localDir: string): string {
        return Path.join(process.cwd(), localDir)
    }

    public static writeFile(outputDir: string, data: any): void {
        FileSystem.writeFileSync(ExporterUtils.getExportDirectory(outputDir), Buffer.from(data, 'base64'))
    }

    public static writeFileFromUrl(outputDir: string, url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => Https.get(url, res => {
            const file = FileSystem.createWriteStream(ExporterUtils.getExportDirectory(outputDir))
            res.pipe(file as any)
                
            file.on('finish', () => {
                file.close()
                resolve()
            })
            file.on('error', (err) => {
                console.error(err)
                file.close()
                reject()
            })
        }))
    }
}