import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function UpdateSetIdsPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<{
    success?: number;
    failed?: number;
    total?: number;
    message?: string;
    error?: string;
  } | null>(null);

  const handleUpdateSetIds = async () => {
    setIsUpdating(true);
    setResult(null);
    
    try {
      const response = await axios.post('/api/admin/update-set-ids');
      setResult(response.data);
      console.log('セットID更新結果:', response.data);
    } catch (error) {
      console.error('セットID更新エラー:', error);
      setResult({ error: '更新処理中にエラーが発生しました。' });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 成功率を計算
  const successRate = result?.success && result?.total 
    ? Math.round((result.success / result.total) * 100) 
    : 0;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">セットID更新ツール</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>問題データのセットID更新</CardTitle>
          <CardDescription>
            既存の問題データから問題IDのフォーマット（E01-C03-01-002）を解析し、
            セットID部分（01）を抽出して保存します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            このツールは、すべての問題データの問題IDからセットID部分を抽出し、
            データベースに保存します。この処理は時間がかかる場合があります。
          </p>
          
          {result && !result.error && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">更新結果</h3>
              <div className="mb-2">
                <Progress value={successRate} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-100 p-2 rounded">
                  <div className="text-xl font-bold text-green-700">{result.success}</div>
                  <div className="text-sm">成功</div>
                </div>
                <div className="bg-red-100 p-2 rounded">
                  <div className="text-xl font-bold text-red-700">{result.failed}</div>
                  <div className="text-sm">失敗</div>
                </div>
                <div className="bg-blue-100 p-2 rounded">
                  <div className="text-xl font-bold text-blue-700">{result.total}</div>
                  <div className="text-sm">合計</div>
                </div>
              </div>
            </div>
          )}
          
          {result?.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUpdateSetIds} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? '更新中...' : 'セットIDを更新する'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}