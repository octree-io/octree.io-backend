export const cppDataStructures = `
struct ListNode {
    int val;
    ListNode* next;

    ListNode() : val(0), next(nullptr) {}

    ListNode(int val) : val(val), next(nullptr) {}

    ListNode(int val, ListNode* next) : val(val), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;

    TreeNode() : val(0), left(nullptr), right(nullptr) {}

    TreeNode(int val) : val(val), left(nullptr), right(nullptr) {}

    TreeNode(int val, TreeNode* left, TreeNode* right) : val(val), left(left), right(right) {}
};

struct GraphNode {
    int val;
    std::vector<GraphNode*> neighbors;

    GraphNode() : val(0) {}

    GraphNode(int val) : val(val) {}

    GraphNode(int val, std::vector<GraphNode*> neighbors) : val(val), neighbors(neighbors) {}
};
`;