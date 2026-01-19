<?php

namespace App\Services;

use App\Repositories\UserRepository;

class UserRoleService
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Check if employee is a Department Head (has approval rights in masterlist)
     */
    public function isDepartmentHead(string $userId): bool
    {
        return $this->userRepository->isDepartmentHead($userId);
    }
    public function isOperationDirector(string $userId): bool
    {
        return $this->userRepository->isOperationDirector($userId);
    }
    public function isMisEmp(string $userId): bool
    {
        return $this->userRepository->isMisEmp($userId);
    }
    public function getRole(string $userId): ?string
    {
        if ($this->userRepository->isDepartmentHead($userId)) {
            return 'DEPARTMENT_HEAD';
        } elseif ($this->userRepository->isOperationDirector($userId)) {
            return 'OPERATION_DIRECTOR';
        } elseif ($this->userRepository->isMisEmp($userId)) {
            return 'MIS_SUPPORT';
        }

        return null;
    }
    public function getEmployees(): array
    {
        return $this->userRepository->getEmployees();
    }
    public function getStaffList(string $empId): ?object
    {
        return $this->userRepository->getStaffList($empId);
    }
}
