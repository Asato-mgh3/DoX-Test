import { Helmet } from "react-helmet";
import TestCreationWizard from "@/components/test-creation/TestCreationWizard";

const TestCreation = () => {
  return (
    <>
      <Helmet>
        <title>テスト作成 - Do-Test</title>
        <meta name="description" content="教科書から簡単にテストを作成できます。章や問題を選択して、オリジナルのテストを生成しましょう。" />
      </Helmet>
      
      <TestCreationWizard />
    </>
  );
};

export default TestCreation;
